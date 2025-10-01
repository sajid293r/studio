"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LoaderCircle, ShieldCheck, Mail, Lock } from "lucide-react";
import React, { useEffect, useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Schema for password login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, "Password is required"),
});

// Schema for magic link
const magicLinkSchema = z.object({
  magicLinkEmail: z.string().email({ message: "Please enter a valid email address." }),
});

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginPageContent() {
  const { user, userProfile, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magiclink'>('password');

  // Get email from URL params if coming from magic link verification
  const emailFromUrl = searchParams.get('email');
  const isVerified = searchParams.get('verified') === 'true';

  // Form for password login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl || "",
      password: "",
    },
  });

  // Form for magic link - separate from password form
  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      magicLinkEmail: emailFromUrl || "",
    },
  });

  useEffect(() => {
    if (user && userProfile) {
      window.location.href = "/dashboard";
    }
  }, [user, userProfile]);

  // Show success message if coming from magic link verification
  useEffect(() => {
    if (isVerified && emailFromUrl) {
      toast({
        title: "Magic Link Verified!",
        description: "Please set your password to complete the sign-in process.",
        className: 'bg-green-600 text-white'
      });
    }
  }, [isVerified, emailFromUrl, toast]);

  // Handle email pre-filling only once on component mount
  useEffect(() => {
    if (emailFromUrl) {
      loginForm.setValue('email', emailFromUrl);
      magicLinkForm.setValue('magicLinkEmail', emailFromUrl);
    }
  }, []); // Empty dependency array - only run once on mount

  // Password login handler
  const onPasswordLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      // First, verify with backend API that user is verified
      const verifyResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        // Show specific error from backend
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: verifyData.error || 'Invalid email or password',
        });
        return;
      }

      // Backend verified user, now sign in with Firebase client-side
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        
        toast({
          title: "Login Successful!",
          description: "Welcome back!",
          className: 'bg-green-600 text-white'
        });
        
        // useAuth hook will handle redirect automatically
      } catch (firebaseError: any) {
        console.error("Firebase login error:", firebaseError);
        
        // Handle Firebase-specific errors
        let errorMessage = 'Failed to sign in. Please try again.';
        if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Invalid email or password';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Failed to login. Please try again.",
      });
    }
  };

  // Magic link handler
  const onMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      // Store email in localStorage for Firebase magic link completion
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', values.magicLinkEmail);
      }

      // Send magic link request
      const response = await fetch('/api/auth/send-custom-email-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.magicLinkEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send magic link');
      }

      setIsEmailSent(true);
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for the login link.",
      });
    } catch (error) {
      console.error("Magic link error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Magic Link",
        description: error instanceof Error ? error.message : "Failed to send magic link. Please try again.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign In Failed",
        description: "Failed to sign in with Google. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Stay Verify account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginMethod === 'password' ? (
            <>
              <Form {...loginForm} key="password-form">
                <form onSubmit={loginForm.handleSubmit(onPasswordLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your email"
                              type="email"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your password"
                              type="password"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setLoginMethod('magiclink');
                    setIsEmailSent(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Use Magic Link instead
                </button>
              </div>
            </>
          ) : (
            <>
              {isEmailSent ? (
                <Alert className="mb-6">
                  <AlertTitle className="text-green-800 dark:text-green-200">Magic Link Sent!</AlertTitle>
                  <AlertDescription className="mb-4">
                    We've sent a magic link to your email. Click the link to sign in.
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEmailSent(false);
                      magicLinkForm.reset();
                    }}
                  >
                    Try Again
                  </Button>
                </Alert>
              ) : (
                <Form {...magicLinkForm} key="magic-link-form">
                  <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                    <FormField
                      control={magicLinkForm.control}
                      name="magicLinkEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address for Magic Link</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter email for magic link"
                                type="email"
                                className="pl-10 h-11"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-11 font-medium"
                      disabled={magicLinkForm.formState.isSubmitting}
                    >
                      {magicLinkForm.formState.isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Sending Link...
                        </>
                      ) : (
                        "Send Magic Link"
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setLoginMethod('password');
                    setIsEmailSent(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Use Password instead
                </button>
              </div>
            </>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}