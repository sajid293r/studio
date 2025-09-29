import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import crypto from 'crypto';

// Set password schema
const setPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email, password } = setPasswordSchema.parse(body);
    
    // Find verified user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('emailVerified', '==', true)
    );
    const userDocs = await getDocs(usersQuery);
    
    if (userDocs.empty) {
      return NextResponse.json(
        { error: 'No verified account found with this email. Please verify your email first.' },
        { status: 404 }
      );
    }
    
    const userDoc = userDocs.docs[0];
    const userData = userDoc.data();
    
    // Check if Firebase Auth user already exists
    if (userData.uid && userData.uid.startsWith('temp_')) {
      // Create Firebase Auth user
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update user profile with real Firebase UID
        await updateDoc(userDoc.ref, {
          uid: firebaseUser.uid,
          firebaseAuthCreated: true,
          passwordSetAt: new Date(),
        });
        
        console.log('Firebase Auth user created for verified user:', firebaseUser.uid);
        
        return NextResponse.json({
          success: true,
          message: 'Password set successfully! You can now log in.',
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
          },
        });
        
      } catch (authError: any) {
        console.error('Failed to create Firebase Auth user:', authError);
        
        if (authError.code === 'auth/email-already-in-use') {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please try logging in instead.' },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to create account. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Account already has a password set. Please try logging in.' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Set password error:', error);
    
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
