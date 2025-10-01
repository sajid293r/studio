import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { getMagicLinkToken, deleteMagicLinkToken, isTokenExpired, storeMagicLinkToken } from '@/lib/magic-link-store';
import crypto from 'crypto';

// Magic link verification schema
const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { token, email } = verifySchema.parse(body);
    
    console.log('Magic link verification attempt for:', email);
    console.log('Token received:', token);
    
    // Verify the token using shared store first
    let tokenData = getMagicLinkToken(token);
    console.log('Token data found in memory:', tokenData);
    
    // If not found in memory, check Firestore (for server restart scenarios)
    if (!tokenData) {
      console.log('Token not found in memory, checking Firestore...');
      const tokenDoc = doc(db, 'magic_link_tokens', token);
      const tokenSnapshot = await getDoc(tokenDoc);
      
      if (tokenSnapshot.exists()) {
        const firestoreTokenData = tokenSnapshot.data();
        console.log('Token found in Firestore:', firestoreTokenData);
        
        // Check if expired
        if (new Date() > firestoreTokenData.expiresAt.toDate()) {
          console.log('Token has expired in Firestore');
          await deleteDoc(tokenDoc);
          return NextResponse.json(
            { error: 'Magic link has expired. Please request a new one.' },
            { status: 401 }
          );
        }
        
        // Convert Firestore data to memory format
        tokenData = {
          email: firestoreTokenData.email,
          expiresAt: firestoreTokenData.expiresAt.toDate().getTime(),
          createdAt: firestoreTokenData.createdAt.toDate().getTime(),
        };
        
        // Restore to memory store
        storeMagicLinkToken(token, tokenData.email, tokenData.expiresAt);
        
        // Delete from Firestore after successful verification
        await deleteDoc(tokenDoc);
      }
    }
    
    if (!tokenData) {
      console.log('Token not found in memory or Firestore');
      return NextResponse.json(
        { error: 'Invalid or expired magic link. Please request a new one.' },
        { status: 401 }
      );
    }
    
    // Check if token has expired
    if (isTokenExpired(tokenData)) {
      deleteMagicLinkToken(token);
      return NextResponse.json(
        { error: 'Magic link has expired. Please request a new one.' },
        { status: 401 }
      );
    }
    
    // Verify email matches
    if (tokenData.email !== email) {
      return NextResponse.json(
        { error: 'Email mismatch. Please use the correct email address.' },
        { status: 401 }
      );
    }
    
    // Check if user exists in Firestore
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const userDocs = await getDocs(usersQuery);
    
    let userDoc;
    let userData;
    
    if (userDocs.empty) {
      // User doesn't exist, create a temporary user account (24 hours expiry)
      console.log('User not found in Firestore, creating temporary account for:', email);
      
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      userDoc = doc(db, 'users', tempUserId);
      
      userData = {
        uid: tempUserId,
        email: email,
        displayName: email.split('@')[0], // Use email prefix as name
        emailVerified: true, // Mark as verified since they used magic link
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
        expiresAt: expiresAt, // 24 hours expiry
        isTemporary: true, // Mark as temporary user
        properties: [],
        isAdmin: false
      };
      
      await setDoc(userDoc, userData);
      console.log('Temporary user created with 24h expiry:', userData);
    } else {
      // User exists, get their data
      userDoc = userDocs.docs[0];
      userData = userDoc.data();
      
      // Check if existing user is expired
      if (userData.isTemporary && userData.expiresAt && new Date() > userData.expiresAt.toDate()) {
        console.log('Temporary user has expired, creating new temporary account');
        
        // Delete expired user
        await deleteDoc(doc(db, 'users', userDoc.id));
        
        // Create new temporary user
        const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        userDoc = doc(db, 'users', tempUserId);
        userData = {
          uid: tempUserId,
          email: email,
          displayName: email.split('@')[0],
          emailVerified: true,
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          expiresAt: expiresAt,
          isTemporary: true,
          properties: [],
          isAdmin: false
        };
        
        await setDoc(userDoc, userData);
        console.log('New temporary user created after expiry cleanup:', userData);
      }
    }
    
    console.log('User data:', {
      email: userData.email,
      emailVerified: userData.emailVerified,
      uid: userData.uid,
    });
    
    // For magic link authentication, we consider the user verified
    // since they have access to the email address
    console.log('Checking emailVerified status:', userData.emailVerified, 'Type:', typeof userData.emailVerified);
    
    if (userData.emailVerified === false) {
      console.log('User email is explicitly marked as not verified, rejecting magic link');
      return NextResponse.json(
        { error: 'Please verify your email address first.' },
        { status: 401 }
      );
    }
    
    // If emailVerified is undefined or true, proceed with magic link authentication
    console.log('Proceeding with magic link authentication for user:', email);
    
    // Create a temporary password for Firebase Auth
    const tempPassword = crypto.randomBytes(16).toString('hex');
    let firebaseUser;
    
    // Try to create Firebase Auth account
    console.log('Attempting to create Firebase Auth account for user:', email);
    
    try {
      firebaseUser = await createUserWithEmailAndPassword(auth, email, tempPassword);
      console.log('Firebase Auth account created successfully');
      
      // Update Firestore with Firebase Auth info
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: firebaseUser.user.uid,
        firebaseAuthCreated: true,
        emailVerified: true, // Mark as verified since they used magic link
        passwordHash: crypto.createHash('sha256').update(tempPassword).digest('hex'),
      });
      
    } catch (authError: any) {
      console.error('Firebase Auth creation error:', authError);
      
      if (authError.code === 'auth/email-already-in-use') {
        // User already exists in Firebase Auth, try to sign them in
        console.log('User already exists in Firebase Auth, attempting to sign in');
        
        try {
          firebaseUser = await signInWithEmailAndPassword(auth, email, tempPassword);
          console.log('Successfully signed in existing user');
          
          // Update Firestore with current Firebase Auth info
          await updateDoc(doc(db, 'users', userDoc.id), {
            uid: firebaseUser.user.uid,
            firebaseAuthCreated: true,
            emailVerified: true, // Mark as verified since they used magic link
            passwordHash: crypto.createHash('sha256').update(tempPassword).digest('hex'),
          });
          
        } catch (signInError: any) {
          console.error('Sign in error:', signInError);
          throw signInError;
        }
      } else {
        throw authError;
      }
    }
    
    // Clean up the token
    deleteMagicLinkToken(token);
    
    return NextResponse.json({
      success: true,
      message: 'Magic link authentication successful!',
      user: {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email,
        displayName: firebaseUser.user.displayName,
        emailVerified: firebaseUser.user.emailVerified,
      },
      tempPassword: tempPassword, // Include temp password for frontend sign-in
      redirectTo: '/dashboard'
    });
    
  } catch (error: any) {
    console.error('Magic link verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'Email is already in use. Please try logging in with password.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Magic link verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
