import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { rateLimitConfig } from '@/lib/email-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import crypto from 'crypto';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Verification request schema
const verificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:emailVerification`;
  const config = rateLimitConfig.emailVerification;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return true;
  }
  
  if (current.count >= config.maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const { email, name } = verificationSchema.parse(body);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store verification token in database
    const verificationRef = doc(db, 'emailVerifications', email);
    await updateDoc(verificationRef, {
      token: verificationToken,
      expiry: tokenExpiry,
      email,
      name,
      createdAt: new Date(),
    }).catch(async () => {
      // If document doesn't exist, create it
      await updateDoc(verificationRef, {
        token: verificationToken,
        expiry: tokenExpiry,
        email,
        name,
        createdAt: new Date(),
      });
    });
    
    // Send verification email
    const result = await emailService.sendEmailVerification({
      email,
      name,
      verificationToken,
    });
    
    if (!result.success) {
      console.error('Verification email failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
