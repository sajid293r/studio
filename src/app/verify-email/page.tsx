"use client";

import { ShieldCheck, CheckCircle, XCircle, LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        console.log('Verifying email with token:', token);
        
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        console.log('Verification response status:', response.status);
        const data = await response.json();
        console.log('Verification response data:', data);

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
          toast({
            title: "Email Verified!",
            description: data.message,
            className: 'bg-green-600 text-white'
          });
          
          // Redirect to set password page after 2 seconds
          setTimeout(() => {
            router.push(`/set-password?email=${encodeURIComponent(data.user.email)}`);
          }, 2000);
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verification failed');
          toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: data.error || 'Failed to verify email',
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Failed to verify email. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Failed to verify email. Please try again.',
        });
      }
    };

    verifyEmail();
  }, [token, toast, router]);

  return (
    <div className="bg-muted/40 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {verificationStatus === 'loading' && (
              <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-headline">
            {verificationStatus === 'loading' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          {verificationStatus === 'loading' && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto mt-2"></div>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting to set your password...
              </p>
              <Button asChild className="w-full">
                <Link href={`/set-password?email=${encodeURIComponent(message.split(' ')[0])}`}>Set Password</Link>
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/register">Try Again</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="bg-muted/40 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-headline">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">Please wait while we load the verification page...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
