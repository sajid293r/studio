'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function VerifyMagicLinkPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        setStatus('loading');
        setMessage('Verifying magic link...');

        // Get token and email from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid magic link. Please request a new one.');
          return;
        }

        setStatus('success');
        setMessage('Magic link verified! Signing you in...');

        // Call our custom verification API
        const response = await fetch('/api/auth/verify-magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Verification failed');
        }

        const result = await response.json();
        
        if (result.success) {
          // The server has created the Firebase Auth user, now sign in on the frontend
          console.log('Server verification successful, signing in user on frontend...');
          
          try {
            // Sign in with the email and temporary password that was created
            if (result.user && result.user.email && result.tempPassword) {
              console.log('Signing in user with temp password...');
              
              // Sign in the user on the frontend
              await signInWithEmailAndPassword(auth, result.user.email, result.tempPassword);
              
              console.log('User signed in successfully on frontend');
              
              toast({
                title: "Login Successful!",
                description: "Welcome to Stay Verify!",
                className: 'bg-green-600 text-white'
              });
              
              // Redirect to dashboard
              router.push('/dashboard');
            } else {
              throw new Error('Invalid user data or missing temp password from server');
            }
          } catch (signInError: any) {
            console.error('Frontend sign-in error:', signInError);
            toast({
              title: "Sign-in Error",
              description: "There was an issue signing you in. Please try logging in manually.",
              className: 'bg-yellow-600 text-white'
            });
            
            // Redirect to login page if sign-in fails
            router.push('/login');
          }
        } else {
          throw new Error(result.error || 'Authentication failed');
        }

      } catch (error: any) {
        console.error('Magic link verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify magic link. Please try again.');
      }
    };

    verifyMagicLink();
  }, [router, toast]);

  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {status === 'loading' && <LoaderCircle className="h-8 w-8 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-2xl font-headline">
            {status === 'loading' && 'Verifying Magic Link...'}
            {status === 'success' && 'Magic Link Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <Button onClick={handleRetry} className="w-full">
              Back to Login
            </Button>
          )}
          
          {status === 'success' && (
            <div className="text-sm text-muted-foreground">
              Redirecting you to the dashboard...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}