import { emailTemplates, verificationConfig } from './email-config';
import { render } from '@react-email/render';
import { NextResponse } from 'next/server';
import React from 'react';
import { ContactFormTemplate } from '../emails/contact-form-template';
import { ContactFormConfirmationTemplate } from '../emails/contact-form-confirmation-template';
import { EmailVerificationTemplate } from '../emails/email-verification-template';
import { WelcomeEmailTemplate } from '../emails/welcome-email-template';
import { SubscriptionWelcomeTemplate } from '../emails/subscription-welcome-template';
import { GuestSubmissionAlertTemplate } from '../emails/guest-submission-alert-template';
import { MagicLinkTemplate } from '../emails/magic-link-template';
import { GuestApprovalTemplate } from '../emails/guest-approval-template';
import { GuestRejectionTemplate } from '../emails/guest-rejection-template';
import nodemailer from 'nodemailer';

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

// Email service class
export class EmailService {
  private transporter = createEmailTransporter();

  // Send email with template
  async sendEmail({
    to,
    subject,
    template,
    data = {},
  }: {
    to: string | string[];
    subject: string;
    template: React.ComponentType<any>;
    data?: any;
  }) {
    try {
      const html = render(React.createElement(template, data));
      
      const mailOptions = {
        from: emailTemplates.from,
        replyTo: emailTemplates.replyTo,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send contact form email
  async sendContactForm({
    name,
    email,
    subject,
    message,
    pageUrl,
    utm,
  }: {
    name: string;
    email: string;
    subject: string;
    message: string;
    pageUrl?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  }) {
    // Send to admin
    const adminResult = await this.sendEmail({
      to: emailTemplates.supportEmail,
      subject: `Contact Form: ${subject}`,
      template: ContactFormTemplate,
      data: { name, email, subject, message, pageUrl, utm },
    });

    // Send confirmation to user
    const userResult = await this.sendEmail({
      to: email,
      subject: `Thank you for contacting Stay Verify - ${subject}`,
      template: ContactFormConfirmationTemplate,
      data: { name, subject, message },
    });

    return adminResult; // Return admin result as primary
  }

  // Send email verification
  async sendEmailVerification({
    email,
    name,
    verificationToken,
  }: {
    email: string;
    name: string;
    verificationToken: string;
  }) {
    const verificationUrl = `${verificationConfig.baseUrl}/verify-email?token=${verificationToken}`;
    
    console.log('Generated verification URL:', verificationUrl);
    console.log('Base URL:', verificationConfig.baseUrl);
    console.log('Token:', verificationToken);
    
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Stay Verify',
      template: EmailVerificationTemplate,
      data: { name, verificationUrl },
    });
  }

  // Send magic link for authentication
  async sendMagicLink({
    email,
    name,
    magicLink,
  }: {
    email: string;
    name: string;
    magicLink: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: 'Your Magic Link - Stay Verify',
      template: MagicLinkTemplate,
      data: { name, magicLink },
    });
  }

  // Send welcome email after verification
  async sendWelcomeEmail({
    email,
    name,
  }: {
    email: string;
    name: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Stay Verify! 🎉',
      template: WelcomeEmailTemplate,
      data: { name, email },
    });
  }

  // Send subscription welcome email
  async sendSubscriptionWelcome({
    email,
    name,
    propertyName,
    planName,
  }: {
    email: string;
    name: string;
    propertyName: string;
    planName: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: `Welcome to ${planName} Plan - ${propertyName}`,
      template: SubscriptionWelcomeTemplate,
      data: { name, propertyName, planName },
    });
  }

  // Send guest submission alert
  async sendGuestSubmissionAlert({
    propertyOwnerEmail,
    propertyName,
    guestName,
    bookingId,
    submissionUrl,
  }: {
    propertyOwnerEmail: string;
    propertyName: string;
    guestName: string;
    bookingId: string;
    submissionUrl: string;
  }) {
    return this.sendEmail({
      to: propertyOwnerEmail,
      subject: `New Guest Submission - ${propertyName}`,
      template: GuestSubmissionAlertTemplate,
      data: { propertyName, guestName, bookingId, submissionUrl },
    });
  }

  // Send guest approval email
  async sendGuestApproval({
    guestEmail,
    guestName,
    propertyName,
    bookingId,
    checkInDate,
    checkOutDate,
  }: {
    guestEmail: string;
    guestName: string;
    propertyName: string;
    bookingId: string;
    checkInDate: string;
    checkOutDate: string;
  }) {
    return this.sendEmail({
      to: guestEmail,
      subject: `✅ ID Verification Approved - ${propertyName}`,
      template: GuestApprovalTemplate,
      data: { guestName, propertyName, bookingId, checkInDate, checkOutDate },
    });
  }

  // Send guest rejection email
  async sendGuestRejection({
    guestEmail,
    guestName,
    propertyName,
    bookingId,
    checkInDate,
    checkOutDate,
    rejectionReason,
  }: {
    guestEmail: string;
    guestName: string;
    propertyName: string;
    bookingId: string;
    checkInDate: string;
    checkOutDate: string;
    rejectionReason?: string;
  }) {
    return this.sendEmail({
      to: guestEmail,
      subject: `⚠️ ID Verification Issue - ${propertyName}`,
      template: GuestRejectionTemplate,
      data: { guestName, propertyName, bookingId, checkInDate, checkOutDate, rejectionReason },
    });
  }
}

export const emailService = new EmailService();
