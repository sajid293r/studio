import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { fallbackEmailService } from '@/lib/email-fallback';
import { storeMagicLinkToken } from '@/lib/magic-link-store';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import crypto from 'crypto';

// Email request schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email } = emailSchema.parse(body);
    
    // Generate a secure magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
    
    console.log(`Creating magic link token for ${email}, expires at: ${new Date(expiresAt).toISOString()}`);
    
    // Store the token using shared store (in-memory)
    storeMagicLinkToken(token, email, expiresAt);
    
    // Also store in Firestore for persistence across server restarts
    const tokenDoc = doc(db, 'magic_link_tokens', token);
    await setDoc(tokenDoc, {
      email: email,
      expiresAt: new Date(expiresAt),
      createdAt: new Date(),
    }, { merge: true });
    
    // Generate custom magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/verify-magic-link?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send custom branded email with the magic link
    console.log('Sending magic link email to:', email);
    let result = await emailService.sendMagicLink({
      email,
      name: email.split('@')[0],
      magicLink,
    });
    
    // If main email service fails, try fallback
    if (!result.success) {
      console.log('Main email service failed, trying fallback service...');
      const fallbackResult = await fallbackEmailService.sendSimpleEmail(
        email,
        'Your Magic Link - Stay Verify',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your Magic Link</h2>
          <p>Click the button below to sign in to your Stay Verify account:</p>
          <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Sign In</a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Stay Verify Team
          </p>
        </div>
        `
      );
      
      result = fallbackResult;
    }
    
    if (!result.success) {
      console.error('Both email services failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send magic link email. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully. Please check your email.',
    });
    
  } catch (error: any) {
    console.error('Magic link error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
}
