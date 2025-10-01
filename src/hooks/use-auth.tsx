"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // must be CLIENT Firebase Auth (not admin)
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Replace server-only imports with API wrappers to keep this component client-safe
async function apiGetUserProfile(uid: string): Promise<UserProfile | null> {
  const r = await fetch(`/api/users/profile?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
  // A 404 is a valid response, it just means the profile needs to be created.
  if (r.status === 404) {
      return null;
  }
  if (!r.ok) {
    throw new Error(`Failed to fetch profile: ${r.statusText}`);
  }
  return (await r.json()) as UserProfile;
}
async function apiCreateUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const r = await fetch('/api/users/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...data }),
  });
  if (!r.ok) {
    throw new Error('Failed to create profile');
  }
  return await r.json();
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmailLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithEmailLink: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleEmailLinkSignIn = useCallback(async () => {
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      setLoading(true);
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation.');
      }
      if (!email) {
        toast({ variant: 'destructive', title: 'Sign In Failed', description: 'Email address is required to complete sign-in.' });
        router.replace('/login');
        setLoading(false);
        return;
      }
      try {
        await firebaseSignInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        // onAuthStateChanged will handle the rest.
      } catch (error) {
        console.error('Email link sign-in error:', error);
        toast({ variant: 'destructive', title: 'Sign In Failed', description: 'The sign-in link is invalid or has expired.' });
        router.replace('/login');
        setLoading(false);
      }
    }
  }, [router, toast]);

  useEffect(() => {
    handleEmailLinkSignIn();
    
    // Handle Google redirect result
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google redirect sign-in successful:', result.user?.email);
        }
      } catch (error) {
        console.error('Google redirect sign-in error:', error);
      }
    };
    
    handleRedirectResult();
  }, [handleEmailLinkSignIn]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setLoading(true); // Set loading at start
      
      if (firebaseUser) {
        console.log('User authenticated:', firebaseUser.email);
        setUser(firebaseUser);
        try {
          let profile = await apiGetUserProfile(firebaseUser.uid);
          
          if (!profile) {
            console.log("No profile found, creating one...");
            const newProfileData: Partial<UserProfile> = {
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
              photoURL: firebaseUser.photoURL || undefined,
            };
            profile = await apiCreateUserProfile(firebaseUser.uid, newProfileData);
          }
          setUserProfile(profile);
          console.log('User profile loaded:', profile.email);

        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Could not load your user profile.',
          });
          await signOut(auth); // sign out to prevent auth loop
          setUser(null);
          setUserProfile(null);
        }
      } else {
        console.log('User logged out, clearing state');
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false); // Set loading false at end
    });

    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    if (loading) return; // Don't redirect while loading
    
    const publicPaths = ['/register', '/login', '/privacy-policy', '/terms-of-service', '/cancellations-and-refunds', '/contact-us'];
    const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';
    const isAuthPage = pathname === '/login';
    const isSubmissionPage = pathname.startsWith('/submission');
    const isPricingPage = pathname === '/pricing';

    console.log('Redirect check:', { 
      loading, 
      user: !!user, 
      userProfile: !!userProfile, 
      pathname, 
      isPublicPage, 
      isAuthPage, 
      isSubmissionPage,
      isPricingPage
    });

    if (user && userProfile) {
      // User is authenticated and profile is loaded
      if (isAuthPage || (isPublicPage && !isPricingPage)) {
        console.log('Redirecting authenticated user to dashboard');
        router.replace('/dashboard');
      }
    } else if (user && !userProfile) {
      // User is authenticated but profile is still loading
      console.log('User authenticated but profile loading, waiting...');
      // Don't redirect, let the profile load
    } else {
      // User is not authenticated
      if (!isPublicPage && !isSubmissionPage) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/login');
      }
    }
  }, [user, userProfile, loading, pathname, router]);

  const signInWithEmailLink = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error: any) {
      console.error('Email link send error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send Link',
        description: error?.code ? `${error.code}: ${error.message}` : 'An unknown error occurred.',
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log('Google sign-in initiated');
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Opening Google sign-in popup');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user?.email);
      
      // onAuthStateChanged will handle the rest of the logic
    } catch (error: any) {
      console.error('Google Sign-In Failed:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        return; // Don't show error for user cancellation
      }
      
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, trying redirect method');
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (redirectError) {
          console.error('Redirect also failed:', redirectError);
          toast({
            variant: 'destructive',
            title: 'Sign-In Failed',
            description: 'Please allow popups or try again later.',
          });
        }
        return;
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return; // Don't show error for cancelled requests
      }
      
      if (error.code === 'auth/internal-error') {
        console.log('Internal error, trying redirect method');
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (redirectError) {
          console.error('Redirect also failed:', redirectError);
          toast({
            variant: 'destructive',
            title: 'Sign-In Failed',
            description: 'Please try again later.',
          });
        }
        return;
      }
      
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error?.message || 'An unknown error occurred.',
      });
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing user profile...');
      const profile = await apiGetUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        console.log('User profile refreshed:', profile.email);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Starting logout process...');
      
      // Sign out from Firebase Auth
      await signOut(auth);
      console.log('Firebase signOut completed');
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      console.log('Local state cleared');
      
      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to login page
      router.push('/login');
      console.log('Redirected to login page');
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Failed to log out. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signInWithEmailLink, signInWithGoogle, logout, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
