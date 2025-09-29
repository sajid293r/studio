"use client";

import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import {
  Bot,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  XCircle,
  LoaderCircle,
  AlertTriangle,
  FileImage,
  Users,
  Copy,
  Mail,
  FileLock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import type { Submission, Guest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVerificationSummary } from '@/app/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onUpdate: (submission: Submission) => void;
  onDelete: (submissionId: string) => void;
  autoOpen?: boolean;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M16.6 14c-.2-.1-1.5-.7-1.7-.8c-.2-.1-.4-.1-.6.1c-.2.2-.6.7-.8.9c-.1.1-.3.2-.5.1c-.2-.1-.9-.3-1.8-1.1c-.7-.6-1.1-1.4-1.3-1.6c-.1-.2 0-.4.1-.5c.1-.1.2-.2.4-.4c.1-.1.2-.2.2-.4c.1-.1 0-.3-.1-.4c0-.1-.6-1.5-.8-2c-.2-.6-.4-.5-.6-.5h-.5c-.2 0-.4.1-.6.3c-.2.2-.8.8-.8 1.9c0 1.1.8 2.2 1 2.4c.1.2 1.5 2.3 3.6 3.2c.5.2.9.4 1.2.5c.5.2 1 .1 1.4-.1c.4-.2.6-.9.8-1.1c.2-.2.2-.4.1-.5c0-.1-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8s8 3.6 8 8s-3.6 8-8 8z"></path></svg>
)


export function DataTableRowActions<TData>({ row, onUpdate, onDelete, autoOpen }: DataTableRowActionsProps<TData>) {
  const submission = row.original as Submission;
  const [isVerifyOpen, setIsVerifyOpen] = React.useState(false);
  const { toast } = useToast();

  // Auto-open verification dialog if autoOpen is true
  React.useEffect(() => {
    if (autoOpen) {
      setIsVerifyOpen(true);
    }
  }, [autoOpen]);

  const handleUpdateGuestStatus = (guestId: string, status: 'Approved' | 'Rejected', summary?: string, issues?: string) => {
    const updatedGuests = submission.guests.map(g => 
      g.id === guestId ? { ...g, status, verificationSummary: summary, verificationIssues: issues } : g
    );

    const allApproved = updatedGuests.every(g => g.status === 'Approved');
    const anyRejected = updatedGuests.some(g => g.status === 'Rejected');
    const allProcessed = updatedGuests.every(g => g.status === 'Approved' || g.status === 'Rejected');
    
    let submissionStatus = submission.status;
    if (submissionStatus !== "Awaiting Guest") {
       if (allApproved) {
            submissionStatus = 'Approved';
        } else if (allProcessed && anyRejected) {
            submissionStatus = 'Partially Approved'; // New status for mixed results
        } else if (allProcessed && !anyRejected) {
            submissionStatus = 'Approved';
        } else {
            submissionStatus = 'Pending';
        }
    }

    onUpdate({ ...submission, guests: updatedGuests, status: submissionStatus });
  };
  
  const handleDelete = () => {
    onDelete(submission.id);
    toast({
        title: 'Submission Deleted',
        description: `Submission for ${submission.mainGuestName} has been deleted.`,
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/submission/${submission.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Submission link copied to clipboard.',
    });
  };

  const handleShareByEmail = () => {
    const url = `${window.location.origin}/submission/${submission.id}`;
    const subject = `Complete your pre-check-in for booking ${submission.bookingId}`;
    const body = `Hello ${submission.mainGuestName},\n\nPlease complete your pre-check-in process by following this link: ${url}\n\nThank you.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleShareByWhatsapp = () => {
    const url = `${window.location.origin}/submission/${submission.id}`;
    const text = `Hello ${submission.mainGuestName}, please complete your pre-check-in for booking ${submission.bookingId} here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={() => setIsVerifyOpen(true)}>Verify Guests</DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" /> Copy Link
          </DropdownMenuItem>
           <DropdownMenuItem onClick={handleShareByEmail}>
            <Mail className="mr-2 h-4 w-4" /> Share via Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareByWhatsapp}>
            <WhatsAppIcon className="mr-2 h-4 w-4" /> Share on WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the submission data for {submission.mainGuestName}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline">Verify Submission: {submission.mainGuestName}</DialogTitle>
            <DialogDescription>
              Review the ID documents for each guest and approve or reject them. The overall status will update once all guests are processed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-6">
                {submission.guests.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full" defaultValue={`item-${submission.guests[0]?.id}`}>
                        {submission.guests.map((guest) => (
                            <GuestVerificationItem key={guest.id} guest={guest} submission={submission} onStatusUpdate={handleUpdateGuestStatus} />
                        ))}
                    </Accordion>
                ): (
                    <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-muted-foreground">
                        <Users className="h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No Guests Found</h3>
                        <p className="mt-1 text-sm">This submission does not have any guests associated with it yet.</p>
                    </div>
                )}
            </ScrollArea>
          </div>
          
          <DialogFooter className="pt-4 mt-auto border-t">
            <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


function GuestVerificationItem({ guest, submission, onStatusUpdate }: { 
  guest: Guest; 
  submission: Submission; 
  onStatusUpdate: (guestId: string, status: 'Approved' | 'Rejected', summary?: string, issues?: string) => void;
}) {
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const [aiSummary, setAiSummary] = React.useState(guest.verificationSummary);
    const [aiIssues, setAiIssues] = React.useState(guest.verificationIssues);
    const { toast } = useToast();

    const hasId = !!guest.idDocumentUrl;
    const isPurged = guest.verificationSummary === 'Data Purged for Compliance';

    const handleGenerateSummary = async () => {
        if (!guest.idDocumentUrl) return;
        setIsAiLoading(true);
        setAiSummary(undefined);
        setAiIssues(undefined);
        try {
          const result = await getVerificationSummary(guest.idDocumentUrl);
          setAiSummary(result.summary);
          setAiIssues(result.potentialIssues);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'AI Analysis Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
        } finally {
          setIsAiLoading(false);
        }
      };

    const handleApprove = async () => {
        onStatusUpdate(guest.id, 'Approved', aiSummary, aiIssues);
        toast({
            title: 'Guest Approved',
            description: `Guest ${guest.guestNumber} has been approved.`,
            className: 'bg-accent text-accent-foreground'
        });
        
        // Send approval email
        try {
          await fetch('/api/submissions/send-status-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submissionId: submission.id,
              guestId: guest.id,
              status: 'Approved',
              guestEmail: guest.guestEmail || submission.mainGuestEmail,
            }),
          });
        } catch (emailError) {
          // Email sending failed silently
        }
    }
    
    const handleReject = async () => {
        onStatusUpdate(guest.id, 'Rejected', aiSummary, aiIssues);
        toast({
            title: 'Guest Rejected',
            description: `Guest ${guest.guestNumber} has been rejected.`,
            variant: 'destructive'
        });
        
        // Send rejection email
        try {
          await fetch('/api/submissions/send-status-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submissionId: submission.id,
              guestId: guest.id,
              status: 'Rejected',
              guestEmail: guest.guestEmail || submission.mainGuestEmail,
              rejectionReason: aiIssues || 'ID verification failed',
            }),
          });
        } catch (emailError) {
          // Email sending failed silently
        }
    }

    const statusVariant = {
        Pending: 'secondary',
        Approved: 'default',
        Rejected: 'destructive',
    }[guest.status] as 'secondary' | 'default' | 'destructive';
  
    return (
        <AccordionItem value={`item-${guest.id}`}>
            <AccordionTrigger>
                <div className="flex items-center gap-4 w-full">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Guest {guest.guestNumber}</span>
                    <Badge variant={statusVariant} className={`ml-auto ${statusVariant === 'default' ? 'bg-accent text-accent-foreground' : ''}`}>
                        {guest.status}
                    </Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 p-2 sm:p-4">
                    <div className="rounded-lg border overflow-hidden relative min-h-[200px] sm:min-h-[300px] bg-muted/30 flex items-center justify-center">
                        {isPurged ? (
                             <div className="text-center text-muted-foreground p-4">
                                <FileLock className="h-10 w-10 mx-auto mb-2" />
                                <p className="font-semibold">Data Purged</p>
                                <p className="text-xs">ID data was deleted for compliance.</p>
                            </div>
                        ) : hasId ? (
                            <Image
                                src={guest.idDocumentUrl!}
                                alt={`ID for Guest ${guest.guestNumber}`}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="p-2"
                                data-ai-hint={guest.idDocumentAiHint}
                            />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <FileImage className="h-10 w-10 mx-auto mb-2" />
                                <p className="font-semibold">ID not yet uploaded</p>
                                <p className="text-xs">The guest has not completed the submission form yet.</p>
                            </div>
                        )}
                    </div>
                     <div className="flex flex-col gap-4">
                        {!hasId ? (
                             <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                                {isPurged ? (
                                    <>
                                        <FileLock className="h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4 text-muted-foreground">ID data was purged for compliance.</p>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">Waiting for guest to upload their ID.</p>
                                )}
                             </div>
                        ) : (
                          <>
                            <Card className="transition-all duration-200 hover:shadow-md">
                              <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-base font-medium font-headline flex items-center gap-2">
                                  <div className={`p-1.5 rounded-full ${isAiLoading ? 'bg-primary/20 animate-pulse' : 'bg-primary/10'}`}>
                                    <Bot className="h-4 w-4 text-primary" />
                                  </div>
                                  AI Summary
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {isAiLoading && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                        <span>Analyzing...</span>
                                      </div>
                                    )}
                                    <Button 
                                        onClick={handleGenerateSummary} 
                                        size="sm" 
                                        variant="outline" 
                                        disabled={isAiLoading || isPurged}
                                        className="transition-all duration-200 hover:bg-primary/10 hover:border-primary/50"
                                    >
                                        {aiSummary ? 'Regenerate' : 'Generate Summary'}
                                    </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {isAiLoading && !aiSummary && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                                      Processing ID document with AI...
                                    </div>
                                    <div className="space-y-2">
                                      <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                                      <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                                    </div>
                                  </div>
                                )}
                                 { !isAiLoading && !aiSummary && !isPurged && (
                                    <div className="pt-2 text-center">
                                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                        <Bot className="h-4 w-4" />
                                        Click "Generate Summary" to analyze this ID with AI
                                      </div>
                                    </div>
                                 )}
                                 {aiSummary && (
                                   <div className="pt-2 animate-fade-in">
                                     <p className="text-sm text-foreground leading-relaxed bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                       {aiSummary}
                                     </p>
                                   </div>
                                 )}
                              </CardContent>
                            </Card>

                            <Card className={`transition-all duration-200 hover:shadow-md ${aiIssues && aiIssues !== 'No issues detected.' && !isPurged ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10" : ""}`}>
                              <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className={`text-base font-medium font-headline flex items-center gap-2 ${aiIssues && aiIssues !== 'No issues detected.' && !isPurged ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                                  <div className={`p-1.5 rounded-full ${aiIssues && aiIssues !== 'No issues detected.' && !isPurged ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-muted/50'}`}>
                                    <AlertTriangle className="h-4 w-4" />
                                  </div>
                                  Potential Issues
                                </CardTitle>
                                 {isAiLoading && (
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                     <LoaderCircle className="h-4 w-4 animate-spin text-amber-500" />
                                     <span>Checking...</span>
                                   </div>
                                 )}
                              </CardHeader>
                              <CardContent className="pt-0">
                                {isAiLoading && !aiIssues && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                                      <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                                      Scanning for potential issues...
                                    </div>
                                    <div className="space-y-2">
                                       <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                                       <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                                    </div>
                                  </div>
                                )}
                                { !isAiLoading && !aiIssues && !isPurged && (
                                    <div className="pt-2 text-center">
                                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                        <AlertTriangle className="h-4 w-4" />
                                        AI issue report will appear here
                                      </div>
                                    </div>
                                )}
                                {aiIssues && (
                                  <div className="pt-2 animate-fade-in">
                                    <p className={`text-sm leading-relaxed p-3 rounded-lg border ${
                                      aiIssues === 'No issues detected.' 
                                        ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                        : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                    }`}>
                                      {aiIssues}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                             <div className="flex justify-end gap-3 mt-auto pt-6">
                                <Button
                                  variant="destructive"
                                  onClick={handleReject}
                                  disabled={isAiLoading || guest.status === 'Rejected' || isPurged}
                                  className="transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> 
                                  {guest.status === 'Rejected' ? 'Rejected' : 'Reject'}
                                </Button>
                                <Button 
                                    onClick={handleApprove} 
                                    disabled={isAiLoading || guest.status === 'Approved' || isPurged} 
                                    className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> 
                                  {guest.status === 'Approved' ? 'Approved' : 'Approve'}
                                </Button>
                            </div>
                          </>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}
