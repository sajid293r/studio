"use client";

import * as React from "react";
import type { Submission } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PartyPopper, ShieldCheck, UploadCloud, Building, LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export function SubmissionForm({ submission: initialSubmission }: { submission: Submission }) {
  const [submission, setSubmission] = React.useState(initialSubmission);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (guestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedGuests = submission.guests.map(g => 
          g.id === guestId ? { ...g, idDocumentUrl: event.target?.result as string } : g
        );
        setSubmission(prev => ({...prev, guests: updatedGuests}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const allIdsUploaded = submission.guests.every(g => !!g.idDocumentUrl);
    if (!allIdsUploaded) {
      toast({
        variant: 'destructive',
        title: "Missing Documents",
        description: "Please upload an ID for every guest.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update submission in Firebase
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          status: "Pending",
          guests: submission.guests.map(guest => ({
            ...guest,
            status: "Pending" as const,
            submittedAt: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      toast({
        title: "Submission Successful!",
        description: "Your documents have been submitted successfully.",
        className: 'bg-green-600 text-white'
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Failed to submit your data. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-2xl text-center animate-scale-in shadow-elevated">
            <CardHeader className="pb-6">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                    <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl font-headline text-green-800 dark:text-green-200">Thank You!</CardTitle>
                <CardDescription className="text-lg text-green-700 dark:text-green-300">Your documents have been submitted successfully.</CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200">
                        The property manager has been notified and will review your submission shortly. You will receive a confirmation once it's approved.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                 <Button 
                    onClick={() => router.push('/')} 
                    className="px-8 py-3 font-medium transition-all duration-200 hover:shadow-lg"
                 >
                    Return to Dashboard (for demo)
                 </Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl animate-fade-in shadow-elevated">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground">
            <Building className="h-4 w-4" /> 
            {submission.propertyName}
          </div>
          <CardTitle className="text-3xl font-headline">Guest Check-in for {submission.mainGuestName}</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Please upload IDs for all guests and accept the terms to complete your pre-check-in securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Alert className="border-primary/20 bg-primary/5">
              <AlertTitle className="font-semibold text-primary">Booking ID</AlertTitle>
              <AlertDescription className="font-mono text-sm break-all">{submission.bookingId}</AlertDescription>
            </Alert>
            <Alert className="border-primary/20 bg-primary/5">
              <AlertTitle className="font-semibold text-primary">Check-in / Check-out</AlertTitle>
              <AlertDescription className="text-sm">
                <span className="block sm:hidden">
                  {format(new Date(submission.checkInDate), 'PP')} - {format(new Date(submission.checkOutDate), 'PP')}
                </span>
                <span className="hidden sm:block">
                  {format(new Date(submission.checkInDate), 'PPP')} - {format(new Date(submission.checkOutDate), 'PPP')}
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <div>
             <h3 className="text-xl font-semibold mb-6 font-headline">Guest Documents</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {submission.guests.map((guest, index) => (
                    <Card key={guest.id} className="overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200 animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                        <CardHeader className="p-4 bg-muted/30 border-b">
                            <CardTitle className="text-base font-medium">Guest {guest.guestNumber}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center aspect-video">
                            {guest.idDocumentUrl ? (
                                <div className="relative group">
                                    <Image 
                                        src={guest.idDocumentUrl} 
                                        alt={`ID Preview ${guest.guestNumber}`} 
                                        width={200} 
                                        height={120} 
                                        className="rounded-lg object-contain border shadow-sm" 
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <p className="text-white text-sm font-medium">Click to change</p>
                                    </div>
                                </div>
                            ): (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Click to upload ID document</p>
                                </div>
                            )}
                            <Button 
                                variant={guest.idDocumentUrl ? "secondary" : "outline"} 
                                size="sm" 
                                className="mt-4 transition-all duration-200 hover:shadow-md" 
                                asChild
                            >
                                <label htmlFor={`file-${guest.id}`} className="cursor-pointer">
                                    {guest.idDocumentUrl ? 'Change ID' : 'Upload ID'}
                                </label>
                            </Button>
                            <input 
                                type="file" 
                                id={`file-${guest.id}`} 
                                accept="image/*,.pdf" 
                                className="hidden" 
                                onChange={(e) => handleFileChange(guest.id, e)} 
                            />
                        </CardContent>
                    </Card>
                ))}
             </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 font-headline">Terms & Conditions</h3>
            <ScrollArea className="h-48 w-full rounded-lg border border-border/50 p-6 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">{submission.termsAndConditions}</pre>
            </ScrollArea>
            <div className="flex items-start space-x-3 mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms} 
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm font-medium leading-relaxed cursor-pointer">
                I, <span className="font-semibold text-primary">{submission.mainGuestName}</span>, have read and accept the terms and conditions above.
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-8">
          <Button 
            className="w-full h-12 text-base font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50" 
            onClick={handleSubmit} 
            disabled={!agreedToTerms || isSubmitting}
            >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                Submitting Documents...
              </>
            ) : (
              "Agree & Submit Documents"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
