// @ts-ignore
const nodemailer = require('nodemailer');

// Email configuration
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL for port 465
  auth: {
    user: process.env.SMTP_USER || 'stayverifed@gmail.com',
    pass: process.env.SMTP_PASS || 'kdwpcrvswkfkvsbv', // Replace with actual app password
  },
};

// Create transporter
export const createTransporter = () => {
  // @ts-ignore
  return nodemailer.createTransport(emailConfig);
};

// Email templates configuration
export const emailTemplates = {
  from: process.env.SMTP_FROM || 'Stay Verify <stayverifed@gmail.com>',
  replyTo: process.env.SMTP_REPLY_TO || 'stayverifed@gmail.com',
  supportEmail: process.env.SMTP_SUPPORT || 'stayverifed@gmail.com',
};

// Rate limiting configuration
export const rateLimitConfig = {
  contactForm: {
    maxRequests: 5, // 5 requests
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  emailVerification: {
    maxRequests: 3, // 3 requests
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

// Email verification configuration
export const verificationConfig = {
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
