
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, UploadCloud, BarChart, CheckCircle, LogIn, Rocket, Bell, Link2, Fingerprint, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { placeHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <UploadCloud className="h-8 w-8 text-primary" />,
    title: "Seamless Guest Check-in",
    description: "Guests can upload their ID documents from anywhere, on any device, before they even arrive.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "AI-Powered Verification",
    description: "Leverage our AI to automatically summarize ID details and flag potential issues for your review.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Centralized Dashboard",
    description: "Manage multiple properties, track all guest submissions, and review documents from one secure place.",
  },
    {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Compliance & Security",
    description: "Ensure data privacy with automated data purging after 60 days, keeping you compliant and your guests secure.",
  },
];

const roadmapFeatures = [
    {
        icon: <Bell className="h-8 w-8 text-primary" />,
        title: "Automated Reminders",
        description: "Automatic check-in and check-out reminders for guests to ensure timely submissions and smooth operations."
    },
    {
        icon: <Link2 className="h-8 w-8 text-primary" />,
        title: "OTA Integration",
        description: "Direct integration with major Online Travel Agencies (OTAs) to automate the creation of verification links upon booking."
    },
    {
        icon: <Fingerprint className="h-8 w-8 text-primary" />,
        title: "Advanced KYC Verification",
        description: "Deep KYC verification using official government APIs like Aadhar OTP and Driving License databases for unparalleled security."
    },
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Live Photo Capture",
        description: "Capture a live photo of the guest at the reception desk to cross-verify against the submitted ID card in real-time."
    }
]

export default function LandingPage() {
  const heroImage = placeHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 transition-all duration-200 hover:scale-105">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold font-headline">Stay Verify</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
             <Link href="#roadmap" className="text-sm font-medium hover:text-primary transition-colors duration-200 relative group">
              Roadmap
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
             </Link>
          </nav>
          <Button asChild className="transition-all duration-200 hover:shadow-lg" size="sm">
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Login / Sign Up</span>
                <span className="sm:hidden">Login</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full pt-24 pb-12 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
             {heroImage && (
                <Image
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    fill
                    src={heroImage.imageUrl}
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40" />
          <div className="container relative mx-auto px-4 md:px-6 text-center text-primary-foreground">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline animate-slide-up">
                Modernize Your Guest Check-in Process
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg md:text-xl opacity-90 animate-slide-up" style={{animationDelay: '200ms'}}>
                Secure, paperless, and efficient ID verification for hotels, homestays, and serviced apartments.
              </p>
              <div className="mt-10 animate-slide-up" style={{animationDelay: '400ms'}}>
                <Button size="lg" className="px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105" asChild>
                  <Link href="/pricing">Get Started Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Why Choose Stay Verify?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-xl">
                Our platform is designed to save you time, enhance security, and improve the guest experience.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="p-4 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                    <CardContent className="flex items-start gap-4 sm:gap-6 pt-4 sm:pt-6">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 flex-shrink-0">
                          {React.cloneElement(feature.icon as React.ReactElement, { 
                            className: "h-6 w-6 sm:h-8 sm:w-8 text-primary" 
                          })}
                        </div>
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl font-bold font-headline">{feature.title}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
             <div className="container mx-auto px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Simple, Transparent Pricing</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-xl">
                        Choose a plan that fits your needs. Activate a property and start verifying guests today.
                    </p>
                </div>
                 <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
                    <Card className="flex flex-col p-6 sm:p-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up">
                        <h3 className="text-xl sm:text-2xl font-bold font-headline">6 Months Plan</h3>
                        <div className="mt-3 sm:mt-4">
                          <p className="text-3xl sm:text-4xl font-bold">₹6666</p>
                          <p className="text-sm sm:text-base text-muted-foreground">Per Property</p>
                        </div>
                        <ul className="mt-8 flex-1 space-y-3">
                            <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Unlimited ID Verifications</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Dashboard Access</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Email Support</span>
                            </li>
                        </ul>
                        <Button className="mt-8 w-full h-12 font-semibold transition-all duration-200 hover:shadow-lg" size="lg" asChild>
                          <Link href="/pricing">Choose Plan</Link>
                        </Button>
                    </Card>
                    <Card className="flex flex-col p-6 sm:p-8 border-2 border-primary shadow-elevated relative overflow-hidden animate-slide-up" style={{animationDelay: '200ms'}}>
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                          POPULAR
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-headline">12 Months Plan</h3>
                        <div className="mt-3 sm:mt-4">
                          <p className="text-3xl sm:text-4xl font-bold">₹9999</p>
                          <p className="text-sm sm:text-base text-muted-foreground">Per Property</p>
                        </div>
                         <ul className="mt-8 flex-1 space-y-3">
                            <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Everything in 6-month plan</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Priority Support</span>
                            </li>
                             <li className="flex items-center gap-3">
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm">Early access to new features</span>
                            </li>
                        </ul>
                        <Button className="mt-8 w-full h-12 font-semibold transition-all duration-200 hover:shadow-lg" size="lg" asChild>
                          <Link href="/pricing">Choose Plan</Link>
                        </Button>
                    </Card>
                </div>
             </div>
        </section>

        <section id="roadmap" className="w-full py-12 md:py-24 lg:py-32  bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center justify-center gap-3">
                    <Rocket className="w-8 h-8 text-primary" />
                    Future Roadmap
                </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-xl">
                We are constantly innovating. Here's a glimpse of what's coming next to make Stay Verify even more powerful.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
              {roadmapFeatures.map((feature, index) => (
                <Card key={index} className="p-4 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up border-l-4 border-l-primary/20 hover:border-l-primary" style={{animationDelay: `${index * 100}ms`}}>
                    <CardContent className="flex items-start gap-4 sm:gap-6 pt-4 sm:pt-6">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 flex-shrink-0">
                          {React.cloneElement(feature.icon as React.ReactElement, { 
                            className: "h-6 w-6 sm:h-8 sm:w-8 text-primary" 
                          })}
                        </div>
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl font-bold font-headline">{feature.title}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Stay Verify. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
             <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:underline underline-offset-4">Terms of Service</Link>
             <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:underline underline-offset-4">Privacy Policy</Link>
             <Link href="/contact-us" className="text-sm text-muted-foreground hover:underline underline-offset-4">Contact Us</Link>
             <Link href="/cancellations-and-refunds" className="text-sm text-muted-foreground hover:underline underline-offset-4">Cancellations & Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
