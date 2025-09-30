
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

async function sendSubscriptionWelcomeEmail(
  customerEmail: string, 
  customerName: string, 
  propertyName: string, 
  planName: string
) {
  const subject = `Welcome to ${planName} - ${propertyName}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563EB;">You're In! 🎉</h1>
      <p>Hi ${customerName},</p>
      <p>Thank you for subscribing to <strong>${planName}</strong> for <strong>${propertyName}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Plan Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Property:</strong> ${propertyName}</li>
          <li><strong>Plan:</strong> ${planName}</li>
        </ul>
      </div>

      <h3>Get Started with Property Configuration</h3>
      <p>Follow these steps to configure your property:</p>
      <ol>
        <li><strong>Add Property Details</strong> - Complete your property information</li>
        <li><strong>Set Up Rooms</strong> - Add room types and rates</li>
        <li><strong>Configure Tax Settings</strong> - Set up applicable taxes</li>
        <li><strong>Integration Setup</strong> - Connect your channel manager or PMS</li>
        <li><strong>Create Submission Links</strong> - Start collecting guest information</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background-color: #2563EB; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📚 Resources:</strong></p>
        <ul style="margin: 10px 0;">
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">Documentation</a></li>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/video-walkthrough">Video Walkthrough</a></li>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Support Center</a></li>
        </ul>
      </div>

      <p>Need help? Just reply to this email and we'll be happy to assist!</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>The Stay Verify Team</strong>
      </p>
    </div>
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
        // Send subscription welcome email with setup instructions
        await sendSubscriptionWelcomeEmail(customerEmail, customerName, propertyName || 'Your Property', planName);
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
