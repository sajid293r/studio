"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, LoaderCircle, AlertTriangle, User, Mail, Building, Phone, ShieldCheck, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Script from "next/script";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";


declare global {
    interface Window {
        Razorpay: any;
    }
}

const plans = [
    {
        name: "6 Months",
        price: 6666,
        priceId: "plan_6m",
        features: [
            "Single Property Activation",
            "Unlimited ID Verifications",
            "Dashboard Access",
            "Email Support",
            "6-Month Validity"
        ],
        duration_in_days: 180,
    },
    {
        name: "12 Months",
        price: 9999,
        priceId: "plan_12m",
        features: [
            "Single Property Activation",
            "Unlimited ID Verifications",
            "Dashboard Access",
            "Priority Email Support",
            "12-Month Validity",
            "Early access to new features"
        ],
        duration_in_days: 365,
    }
];

const GST_RATE = 0.18;

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  propertyName: z.string().min(3, "Property name is required"),
  propertyAddress: z.string().min(10, "Property address is required"),
  propertyContact: z.string().min(10, "A valid phone number is required."),
});

function PricingClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user, userProfile, loading: authLoading } = useAuth();
    const [selectedPlan, setSelectedPlan] = React.useState<(typeof plans)[0] | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [paymentSuccess, setPaymentSuccess] = React.useState(false);
    const [propertyData, setPropertyData] = React.useState<any>(null);

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
    });

    // Fetch property data by ID
    const fetchPropertyData = async (propertyId: string) => {
        try {
            const response = await fetch(`/api/properties/${propertyId}`);
            if (response.ok) {
                const property = await response.json();
                setPropertyData(property);
                console.log('Fetched property data:', property);
                
                // Auto-fill form with property data
                if (property.name) form.setValue('propertyName', property.name);
                if (property.address) form.setValue('propertyAddress', property.address);
                if (property.contactPhone) form.setValue('propertyContact', property.contactPhone);
            } else {
                console.error('Failed to fetch property data');
            }
        } catch (error) {
            console.error('Error fetching property data:', error);
        }
    };

    useEffect(() => {
        const planId = searchParams.get('planId');
        const propertyId = searchParams.get('propertyId');

        console.log('URL Parameters received:', {
            planId,
            propertyId
        });

        if (planId) {
            const preselectedPlan = plans.find(p => p.priceId === planId);
            if (preselectedPlan) {
                setSelectedPlan(preselectedPlan);
            }
        }

        // Fetch property data if propertyId is provided
        if (propertyId) {
            fetchPropertyData(propertyId);
        }

        // Auto-fill user information from userProfile
        if (userProfile) {
            if (userProfile.displayName) {
                form.setValue('name', userProfile.displayName);
            }
            if (userProfile.email) {
                form.setValue('email', userProfile.email);
            }
        }

        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            setPaymentSuccess(true);
            toast({
                title: "Payment Successful!",
                description: "Your subscription is active. Please check your email for login instructions.",
                className: "bg-green-600 text-white",
                duration: 8000
            });
        } else if (paymentStatus === 'cancelled') {
             toast({
                variant: 'destructive',
                title: 'Payment Cancelled',
                description: 'Your payment was cancelled. You can try again anytime.',
            });
        }
    }, [searchParams, toast, form, userProfile]);

    const handleSelectPlan = (plan: typeof plans[0]) => {
        setSelectedPlan(plan);
    };

    const handleBack = () => {
        setSelectedPlan(null);
        form.reset();
    };

    const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
        if (!selectedPlan) return;
        
        // Check if user is authenticated
        if (!user || !userProfile) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'Please log in to proceed with payment.',
            });
            router.push('/login');
            return;
        }
        
        setIsLoading(true);

        try {
            // Check if we're activating an existing property
            const existingPropertyId = searchParams.get('propertyId');
            
            const response = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: selectedPlan,
                    userDetails: values,
                    existingPropertyId: existingPropertyId, // Pass existing property ID if available
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create Razorpay order');
            }

            const order = await response.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Stay Verify",
                description: `Subscription for ${selectedPlan.name}`,
                order_id: order.id,
                handler: function (response: any) {
                    router.push('/pricing?payment=success');
                },
                prefill: {
                    name: values.name,
                    email: values.email,
                },
                notes: {
                    planName: selectedPlan.name,
                    propertyName: values.propertyName,
                },
                theme: {
                    color: "#2563EB" // Blue
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                console.error('Payment failed:', response.error);
                toast({
                    variant: 'destructive',
                    title: 'Payment Failed',
                    description: response.error.description || response.error.reason || 'Something went wrong during payment processing.',
                });
                setIsLoading(false);
            });

            rzp.on('payment.cancelled', function (){
                toast({
                    title: 'Payment Cancelled',
                    description: 'You cancelled the payment. No charges were made.',
                    variant: 'default'
                });
                setIsLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Payment error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Could not initiate payment. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: errorMessage,
            });
            setIsLoading(false);
        }
    };
    
    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (paymentSuccess) {
         return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md text-center animate-scale-in shadow-elevated">
                    <CardHeader className="pb-6">
                        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                            <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-3xl font-headline text-green-800 dark:text-green-200">Payment Received!</CardTitle>
                        <CardDescription className="pt-2 text-lg text-green-700 dark:text-green-300">
                           Thank you for subscribing to Stay Verify. Your property is now active.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertTitle className="text-blue-800 dark:text-blue-200">Check Your Email</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-300">
                                We've sent an email to you with instructions on how to access your dashboard and set your password.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button asChild className="w-full h-12 font-semibold transition-all duration-200 hover:shadow-lg">
                            <Link href="/properties">Go to Properties</Link>
                        </Button>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                <strong>Next Steps:</strong>
                            </p>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>1. Check your email for login instructions</p>
                                <p>2. Use "Forgot Password" to set your password</p>
                                <p>3. Go to Properties to activate your subscription</p>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }


    return (
        <>
        <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
        />
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            {selectedPlan ? (
                <Card className="w-full max-w-lg animate-scale-in shadow-elevated">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Complete Your Purchase</CardTitle>
                        <CardDescription className="text-base">
                            You are subscribing to the <span className="font-semibold text-primary">{selectedPlan.name}</span> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Your Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="Your Name" className="pl-8" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="your@email.com" className="pl-8" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <h3 className="text-lg font-medium border-b pb-2 pt-4">Property Details</h3>
                                 <FormField
                                    control={form.control}
                                    name="propertyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="e.g., The Grand Resort" className="pl-8" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="propertyAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Full Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St, Anytown, USA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="propertyContact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Contact Phone</FormLabel>
                                            <FormControl>
                                                 <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="+91 12345 67890" className="pl-8" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <CardFooter className="flex-col items-stretch gap-4 !p-0 !pt-6">
                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        disabled={isLoading}
                                        className="h-12 font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            `Pay ₹${Math.round((selectedPlan.price * (1 + GST_RATE)))} & Activate Property`
                                        )}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={handleBack}
                                        disabled={isLoading}
                                        className="transition-all duration-200 hover:bg-muted/50"
                                    >
                                        Choose a different plan
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <>
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline">Activate Your Property</h1>
                    <p className="text-muted-foreground mt-2 text-base sm:text-lg">Select a subscription plan to get started with Stay Verify.</p>
                </div>
                
                {!user && (
                    <Alert className="max-w-4xl w-full mb-8">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Login Required</AlertTitle>
                        <AlertDescription>
                            Please log in to your account to select a subscription plan and make payments.
                            <Button asChild variant="link" className="p-0 h-auto ml-2">
                                <Link href="/login">Login here</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                
                 {!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
                     <Alert variant="destructive" className="max-w-4xl w-full mb-8">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Configuration Error</AlertTitle>
                        <AlertDescription>
                            The payment gateway is not configured. Please contact support to enable subscriptions.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
                    {plans.map((plan, index) => {
                        const gstAmount = plan.price * GST_RATE;
                        const totalAmount = plan.price + gstAmount;

                        return (
                            <Card key={plan.name} className={`flex flex-col shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up ${plan.name === '12 Months' ? 'border-2 border-primary' : ''}`} style={{animationDelay: `${index * 200}ms`}}>
                                <CardHeader className="relative">
                                    {plan.name === '12 Months' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                            POPULAR
                                        </div>
                                    )}
                                    <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground pt-2">Billed once per property.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-muted-foreground">Base Price</span>
                                            <span className="text-xl font-semibold">₹{plan.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-muted-foreground">GST (18%)</span>
                                            <span className="text-xl font-semibold">₹{gstAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold">Total Amount</span>
                                            <span className="text-4xl font-bold">₹{Math.round(totalAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <ul className="space-y-2 pt-4">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <Check className="h-5 w-5 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full h-12 font-semibold transition-all duration-200 hover:shadow-lg" 
                                        size="lg" 
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={!user || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
                                        variant={plan.name === '12 Months' ? 'default' : 'outline'}
                                    >
                                        {!user ? (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Login Required
                                            </>
                                        ) : (
                                            'Choose Plan'
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
                 {!user && (
                    <Button variant="link" className="mt-8" asChild>
                        <Link href="/login">Already have an account? Sign In</Link>
                    </Button>
                )}
                </>
            )}
        </div>
        </>
    );
}

function PricingPageSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            <div className="text-center mb-8">
                <Skeleton className="h-10 w-80 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                <Card className="flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <Separator />
                        <ul className="space-y-4 pt-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <Separator />
                        <ul className="space-y-4 pt-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default function PricingPage() {
    return (
        <Suspense fallback={<PricingPageSkeleton />}>
            <PricingClient />
        </Suspense>
    )
}

    
