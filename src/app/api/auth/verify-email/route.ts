import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { emailService } from '@/lib/email-service';
import crypto from 'crypto';

// Verification schema
const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Shared verification function
async function verifyEmailToken(token: string) {
  console.log('Verification attempt with token:', token);
  
  // Find verification record by querying with token field
  const verificationQuery = query(
    collection(db, 'email_verifications'),
    where('token', '==', token)
  );
  
  const querySnapshot = await getDocs(verificationQuery);
  
  console.log('Looking for token:', token);
  console.log('Query snapshot size:', querySnapshot.size);
  
  if (querySnapshot.empty) {
    console.log('Token not found in database');
    return NextResponse.json(
      { error: 'Invalid or expired verification token' },
      { status: 400 }
    );
  }
  
  const verificationDoc = querySnapshot.docs[0];
  const verificationData = verificationDoc.data();
  
  console.log('Found verification data:', verificationData);
  
  // Check if token is expired
  const now = new Date();
  const expiryDate = verificationData.expiresAt.toDate();
  
  if (now > expiryDate) {
    return NextResponse.json(
      { error: 'Verification token has expired' },
      { status: 400 }
    );
  }
  
  // Check if already consumed
  if (verificationData.consumedAt) {
    return NextResponse.json(
      { error: 'Verification token has already been used' },
      { status: 400 }
    );
  }
  
  // Mark token as consumed
  await updateDoc(verificationDoc.ref, {
    consumedAt: new Date(),
  });
  
  // Now create the actual Firebase Auth user since email is verified
  let firebaseUser;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      verificationData.email, 
      'temp_password_will_be_reset' // We'll need to implement password reset flow
    );
    firebaseUser = userCredential.user;
    
    // Update user profile with real Firebase UID and mark as verified
    const userRef = doc(db, 'users', verificationData.userId);
    await updateDoc(userRef, {
      uid: firebaseUser.uid, // Update with real Firebase UID
      emailVerified: true,
      emailVerifiedAt: new Date(),
      firebaseAuthCreated: true,
    });
    
    console.log('Firebase Auth user created:', firebaseUser.uid);
    
  } catch (authError: any) {
    console.error('Failed to create Firebase Auth user:', authError);
    
    // Handle specific Firebase Auth errors
    if (authError.code === 'auth/email-already-in-use') {
      console.log('User already exists in Firebase Auth, marking as verified');
      
      // Mark as verified without creating new Firebase Auth user
      const userRef = doc(db, 'users', verificationData.userId);
      await updateDoc(userRef, {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        firebaseAuthLinked: true,
        firebaseAuthNote: 'User already exists in Firebase Auth',
      });
      
      console.log('Email verified for existing Firebase Auth user');
    } else {
      // Still mark as verified even if Firebase Auth creation fails
      const userRef = doc(db, 'users', verificationData.userId);
      await updateDoc(userRef, {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        firebaseAuthError: authError instanceof Error ? authError.message : 'Unknown error',
      });
    }
  }
  
  // Emit domain event UserVerified (log for now)
  console.log('Domain event: UserVerified', {
    userId: verificationData.userId,
    email: verificationData.email,
    verifiedAt: new Date(),
  });
  
  // Queue welcome email
  try {
    await emailService.sendWelcomeEmail({
      email: verificationData.email,
      name: verificationData.name,
    });
    console.log('Welcome email queued successfully');
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
    // Don't fail verification if welcome email fails
  }
  
  return NextResponse.json({
    success: true,
    message: 'Email verified successfully! Welcome to Stay Verify!',
    user: {
      email: verificationData.email,
      name: verificationData.name,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    redirectTo: '/login'
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    return await verifyEmailToken(token);
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { token } = verifySchema.parse(body);
    
    return await verifyEmailToken(token);
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid verification data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
