// Fallback email service using a different approach
import nodemailer from 'nodemailer';

export class FallbackEmailService {
  private transporter;

  constructor() {
    // Try multiple SMTP configurations
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'stayverifed@gmail.com',
        pass: process.env.SMTP_PASS || 'kdwpcrvswkfkvsbv',
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      // Add more robust connection options
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
    });
  }

  async sendSimpleEmail(to: string, subject: string, html: string) {
    try {
      console.log('Sending email via fallback service to:', to);
      
      const mailOptions = {
        from: '"Stay Verify" <stayverifed@gmail.com>',
        to: to,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Fallback email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Fallback email failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async verifyConnection() {
    try {
      console.log('Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

export const fallbackEmailService = new FallbackEmailService();
