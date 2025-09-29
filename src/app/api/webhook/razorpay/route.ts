
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { doc, getDocs, setDoc, updateDoc, collection, query, where, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { render } from '@react-email/render';
import { InvoiceTemplate } from '@/components/invoice-template';
import { addProperty, createUserProfile, getUserProfile } from '@/app/lib/user-actions';
import type { UserProfile } from '@/lib/types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import nodemailer from 'nodemailer';


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
const GST_RATE = 0.18;
const COMPANY_GSTIN = '30APEPK9418B3ZB';
const COMPANY_NAME = 'MYKA STAYS';
const COMPANY_ADDRESS = 'SHOP NO 6, Second Floor, Karma Point, Vasco da Gama, Goa 403802';

// Create nodemailer transporter directly
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // SSL for port 465
    auth: {
      user: process.env.SMTP_USER || 'stayverifed@gmail.com',
      pass: process.env.SMTP_PASS || 'kdwpcrvswkfkvsbv', // Replace with actual app password
    },
  });
};


async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Stay Verify <stayverifed@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw error, just log it
  }
}

async function sendWelcomeEmail(customerEmail: string, customerName: string) {
    const subject = "Welcome to Stay Verify! Your property is ready.";
    const htmlBody = `
        <h1>Welcome, ${customerName}!</h1>
        <p>Thank you for subscribing to Stay Verify. We're excited to have you on board.</p>
        <p>We have created an account for you with the email: <strong>${customerEmail}</strong>.</p>
        <p>To access your dashboard and set your password, please use the "Forgot Password" option on our login page with your email address.</p>
        <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #2563EB; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                Go to Login Page
            </a>
        </p>
        <p>Once you log in, you can start creating guest submission links from your dashboard.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Stay Verify Team</p>
    `;
    await sendEmail(customerEmail, subject, htmlBody);
}

async function sendInvoiceEmail(invoiceDetails: any) {
    const subject = `Your Stay Verify Invoice (${invoiceDetails.invoiceNumber})`;
    const invoiceHtml = render(InvoiceTemplate(invoiceDetails) as any);
    await sendEmail(invoiceDetails.customerEmail, subject, invoiceHtml);
}

// Store webhook event in database
async function storeWebhookEvent(event: any, status: 'received' | 'processing' | 'completed' | 'failed', error?: string) {
  try {
    await addDoc(collection(db, 'webhook_events'), {
      event_type: event.event,
      event_id: event.event_id || `evt_${Date.now()}`,
      status: status,
      raw_data: event,
      processed_at: new Date(),
      error_message: error || null,
      created_at: new Date(),
    });
    console.log(`Webhook event stored: ${event.event} - ${status}`);
  } catch (error) {
    console.error('Failed to store webhook event:', error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    await storeWebhookEvent({ event: 'unknown' }, 'failed', 'Signature missing');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(body);
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    await storeWebhookEvent({ event: 'unknown' }, 'failed', 'Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  
  // Store webhook event as received
  await storeWebhookEvent(event, 'received');

  if (event.event === 'payment.captured') {
    try {
      // Mark webhook as processing
      await storeWebhookEvent(event, 'processing');
      
      const payment = event.payload.payment.entity;
      const order = await razorpayInstance.orders.fetch(payment.order_id);
      const { notes } = order;


      const {
        planName,
        planDuration,
        basePrice,
        customerName,
        customerEmail,
        propertyName,
        propertyAddress,
        propertyContact,
        existingPropertyId
      } = notes as any;

      if (!customerEmail || !customerName) {
        throw new Error('Missing required customer data in payment notes');
      }

      if (!existingPropertyId && (!propertyName || !propertyAddress || !propertyContact)) {
        throw new Error('Missing required property data in payment notes');
      }

      // 1. Find or Create User
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', customerEmail));
      const querySnapshot = await getDocs(q);

      let userId = '';
      let userProfile: UserProfile | null = null;
      
      if (querySnapshot.empty) {
        // User does not exist, create one
        const newUserId = `user_${Date.now()}`; // Non-firebase-auth user ID
        const newUserProfileData: Partial<UserProfile> = {
          email: customerEmail,
          displayName: customerName,
          createdAt: new Date(),
          properties: [],
          isAdmin: customerEmail === 'admin@stayverify.com'
        };
        await createUserProfile(newUserId, newUserProfileData);
        userId = newUserId;
        await sendWelcomeEmail(customerEmail, customerName);
        // Note: For non-auth users, sending a password reset won't work directly.
        // The welcome email instructs them to use the "forgot password" flow, which implies a user should be created in Firebase Auth.
        // For a full implementation, you'd create the user in Firebase Auth here.
      } else {
        // User exists
        userId = querySnapshot.docs[0].id;
        userProfile = querySnapshot.docs[0].data() as UserProfile;
      }
      
      // 2. Create or Activate Property
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(planDuration, 10));

      let propertyRef;
      let propertyId;

      // Check if this is activation of existing property (from notes)
      if (existingPropertyId) {
        // Activate existing property
        propertyId = existingPropertyId;
        propertyRef = doc(db, 'properties', propertyId);
      } else {
        // Create new property
        const newPropertyData = {
          name: propertyName,
          address: propertyAddress,
          contactPhone: propertyContact,
        };
        const newProperty = await addProperty(userId, newPropertyData, null);
        propertyId = newProperty.id;
        propertyRef = doc(db, 'properties', propertyId);
      }

      const updatedPropertyData = {
        subscription_id: payment.order_id,
        subscription_status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
      };
      
      await updateDoc(propertyRef, updatedPropertyData);

      // Update the property in user profile as well
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const properties = userData.properties || [];
        
        // Update the specific property in the user's properties array
        const updatedProperties = properties.map((prop: any) => 
          prop.id === propertyId ? { ...prop, ...updatedPropertyData } : prop
        );
        
        await updateDoc(userRef, {
          properties: updatedProperties,
          updatedAt: new Date()
        });
        
      }

      // 3. Prepare and "Send" Invoice
      const basePriceNum = Number(basePrice);
      const gstAmount = basePriceNum * GST_RATE;
      const totalAmount = basePriceNum + gstAmount;

      const invoiceDetails = {
        invoiceNumber: payment.id,
        invoiceDate: new Date().toLocaleDateString('en-GB'),
        customerName: customerName,
        customerEmail: customerEmail,
        planName: planName,
        basePrice: basePriceNum.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        companyName: COMPANY_NAME,
        companyAddress: COMPANY_ADDRESS,
        companyGstin: COMPANY_GSTIN,
      };

      await sendInvoiceEmail(invoiceDetails);

      // Mark webhook as completed
      await storeWebhookEvent(event, 'completed');
      
      console.log('Webhook processing completed successfully');
      return NextResponse.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark webhook as failed
      await storeWebhookEvent(event, 'failed', errorMessage);
      
      return NextResponse.json({ error: 'Failed to process webhook', details: errorMessage }, { status: 500 });
    }
  }

  // Store other webhook events as completed (they don't need processing)
  await storeWebhookEvent(event, 'completed');
  return NextResponse.json({ status: 'received' });
}
