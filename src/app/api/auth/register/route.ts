import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { doc, setDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import crypto from 'crypto';

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    console.log('Registration request body:', body);
    
    const { email, password, displayName } = registerSchema.parse(body);
    console.log('Registration data parsed successfully:', { email, displayName, passwordLength: password.length });
    
    // Check if email already exists in users collection
    console.log('Checking if email exists in users collection...');
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const existingUsers = await getDocs(usersQuery);
    
    console.log('Existing users found:', existingUsers.size);
    
    if (!existingUsers.empty) {
      console.log('Email already exists in users collection');
      return NextResponse.json(
        { error: 'An account with this email already exists. Please use a different email or try logging in.' },
        { status: 400 }
      );
    }
    
    // Check if email already exists in email_verifications collection (pending verification)
    console.log('Checking if email has pending verification...');
    const verificationQuery = query(
      collection(db, 'email_verifications'),
      where('email', '==', email),
      where('consumedAt', '==', null) // Not yet consumed
    );
    const existingVerifications = await getDocs(verificationQuery);
    
    console.log('Existing verifications found:', existingVerifications.size);
    
    if (!existingVerifications.empty) {
      console.log('Email has pending verification');
      return NextResponse.json(
        { error: 'A verification email has already been sent to this address. Please check your email or try again later.' },
        { status: 400 }
      );
    }
    
    // Generate 128-bit (16 bytes) verification token as per requirements
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours TTL as per requirements
    
    // Create unverified user profile (no Firebase Auth user yet)
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userRef = doc(db, 'users', tempUserId);
    
    // Store password hash (in production, use proper hashing)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    console.log('Storing user with password hash:', {
      tempUserId,
      email,
      passwordHashPreview: passwordHash.substring(0, 10) + '...',
      passwordLength: password.length,
    });
    
    await setDoc(userRef, {
      uid: tempUserId,
      email: email,
      displayName,
      passwordHash, // Store hashed password
      emailVerified: false,
      emailVerifiedAt: null,
      createdAt: new Date(),
      properties: [],
      isAdmin: email === 'admin@stayverify.com'
    });
    
    // Create email_verifications row with token hash for security
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationData = {
      userId: tempUserId,
      email: email,
      tokenHash, // Store hash of token, not raw token
      token: verificationToken, // Keep raw token for email (will be deleted after use)
      password: password, // Store original password for Firebase Auth creation after verification
      createdAt: new Date(),
      expiresAt: tokenExpiry,
      consumedAt: null,
      name: displayName,
    };
    
    await addDoc(collection(db, 'email_verifications'), verificationData);
    
    console.log('Registration data stored:', {
      tempUserId,
      email,
      tokenHash: tokenHash.substring(0, 10) + '...',
      expiresAt: tokenExpiry
    });
    
    // Send verification email with proper URL
    console.log('Sending verification email...');
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const emailResult = await emailService.sendEmailVerification({
      email: email,
      name: displayName,
      verificationToken,
    });
    
    if (!emailResult.success) {
      console.error('Verification email failed:', emailResult.error);
      // Don't fail registration if email fails
    } else {
      console.log('Verification email sent successfully:', emailResult.messageId);
    }
    
    console.log('Registration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      verificationUrl: verificationUrl, // For testing purposes
      user: {
        tempId: tempUserId,
        email: email,
        displayName,
        emailVerified: false
      },
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      console.log('Zod validation errors:', error.errors);
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('email-already-in-use')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }
      if (error.message.includes('weak-password')) {
        return NextResponse.json(
          { error: 'Password is too weak' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
