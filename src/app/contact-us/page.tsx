"use client";

import { ShieldCheck, Mail, Phone, MapPin, Send, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  pageUrl: z.string().url().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      pageUrl: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    },
  });

  // Auto-populate UTM parameters from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const utmSource = url.searchParams.get('utm_source') || '';
      const utmMedium = url.searchParams.get('utm_medium') || '';
      const utmCampaign = url.searchParams.get('utm_campaign') || '';
      
      form.setValue('pageUrl', window.location.href);
      form.setValue('utmSource', utmSource);
      form.setValue('utmMedium', utmMedium);
      form.setValue('utmCampaign', utmCampaign);
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          page_url: values.pageUrl,
          utm_source: values.utmSource,
          utm_medium: values.utmMedium,
          utm_campaign: values.utmCampaign,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: data.message,
          className: 'bg-green-600 text-white'
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to send message. Please try again.',
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/40 min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                 <Link href="/" className="flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">Stay Verify</span>
                </Link>
            </div>
        </header>
        <main className="flex-1 container py-12 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Get in Touch</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    We're here to help. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                </p>
            </div>
            
            {/* Contact Form */}
            <div className="max-w-2xl mx-auto mt-12">
              <Card className="shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline text-center">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          {...form.register('name')}
                          placeholder="Your full name"
                          className="h-11"
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('email')}
                          placeholder="your@email.com"
                          className="h-11"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        {...form.register('subject')}
                        placeholder="What's this about?"
                        className="h-11"
                      />
                      {form.formState.errors.subject && (
                        <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...form.register('message')}
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px] resize-none"
                      />
                      {form.formState.errors.message && (
                        <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                            <Mail className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-xl font-headline">Email Us</CardTitle>
                        <p className="text-muted-foreground mt-2">For sales and general inquiries.</p>
                        <a href="mailto:sales@stayverify.com" className="text-primary font-medium mt-4 inline-block hover:underline">
                            sales@stayverify.com
                        </a>
                    </CardContent>
                </Card>
                 <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                            <Phone className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-xl font-headline">Call Us</CardTitle>
                        <p className="text-muted-foreground mt-2">Speak with our team directly.</p>
                        <a href="tel:+918793869171" className="text-primary font-medium mt-4 inline-block hover:underline">
                            +91 87938 69171
                        </a>
                    </CardContent>
                </Card>
                 <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                            <MapPin className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-xl font-headline">Our Office</CardTitle>
                        <p className="text-muted-foreground mt-2">
                           MYKA STAYS<br/>
                           SHOP NO 6, Second Floor, Karma Point,<br/>
                           Vasco da Gama, Goa 403802, India
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <Suspense fallback={
      <div className="bg-muted/40 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}