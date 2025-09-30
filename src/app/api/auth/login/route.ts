import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import crypto from 'crypto';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    // First, check if user exists in Firestore (registered but maybe not verified)
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const userDocs = await getDocs(usersQuery);
    
    console.log('Login attempt for:', email);
    console.log('User docs found:', userDocs.size);
    
    if (userDocs.empty) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please register first.' },
        { status: 401 }
      );
    }
    
    // If multiple users found, prefer the one with real Firebase UID (not temp_)
    let userDoc = userDocs.docs[0];
    if (userDocs.size > 1) {
      console.log('Multiple users found, filtering for verified user...');
      const verifiedUser = userDocs.docs.find(doc => {
        const data = doc.data();
        return data.emailVerified && data.uid && !data.uid.startsWith('temp_');
      });
      if (verifiedUser) {
        userDoc = verifiedUser;
        console.log('Found verified user:', verifiedUser.data().uid);
      }
    }
    
    const userData = userDoc.data();
    
    console.log('User data:', {
      email: userData.email,
      emailVerified: userData.emailVerified,
      hasPasswordHash: !!userData.passwordHash,
      uid: userData.uid,
    });
    
    // Check if user is verified
    if (!userData.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in. Check your email for the verification link.' },
        { status: 401 }
      );
    }
    
    // Verify password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    console.log('Password hash comparison:', {
      provided: passwordHash.substring(0, 10) + '...',
      stored: userData.passwordHash ? userData.passwordHash.substring(0, 10) + '...' : 'MISSING',
      match: userData.passwordHash === passwordHash,
    });
    
    if (!userData.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set for this account. Please use magic link or Google sign-in.' },
        { status: 401 }
      );
    }
    
    if (userData.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if Firebase Auth user exists
    if (userData.firebaseAuthCreated && userData.uid && !userData.uid.startsWith('temp_')) {
      // User has Firebase Auth account, sign them in
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        return NextResponse.json({
          success: true,
          message: 'Login successful!',
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            emailVerified: userCredential.user.emailVerified,
          },
          redirectTo: '/dashboard'
        });
      } catch (authError: any) {
        console.error('Firebase Auth login error:', authError);
        
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }
        
        if (authError.code === 'auth/email-not-verified') {
          return NextResponse.json(
            { error: 'Please verify your email address before logging in.' },
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: 'Login failed. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // User exists in Firestore but not in Firebase Auth yet
      // This shouldn't happen if verification worked properly, but handle it
      return NextResponse.json(
        { error: 'Account verification incomplete. Please verify your email address first.' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid login data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
