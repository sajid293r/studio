import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { emailService } from '@/lib/email-service';

// Email request schema
const emailSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  guestId: z.string().min(1, 'Guest ID is required'),
  status: z.enum(['Approved', 'Rejected']),
  guestEmail: z.string().email('Valid guest email is required'),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { submissionId, guestId, status, guestEmail, rejectionReason } = emailSchema.parse(body);
    
    // Get submission details
    const submissionRef = doc(db, 'submissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    const submission = submissionDoc.data();
    
    // Find the specific guest
    const guest = submission.guests.find((g: any) => g.id === guestId);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    
    // Use individual guest email if available, otherwise fall back to main guest email
    const emailToUse = guest.guestEmail || submission.mainGuestEmail;
    
    // Format dates
    const checkInDate = new Date(submission.checkInDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const checkOutDate = new Date(submission.checkOutDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Send appropriate email based on status
    let result;
    if (status === 'Approved') {
      result = await emailService.sendGuestApproval({
        guestEmail: emailToUse,
        guestName: submission.mainGuestName,
        propertyName: submission.propertyName,
        bookingId: submission.bookingId,
        checkInDate,
        checkOutDate,
      });
    } else {
      result = await emailService.sendGuestRejection({
        guestEmail: emailToUse,
        guestName: submission.mainGuestName,
        propertyName: submission.propertyName,
        bookingId: submission.bookingId,
        checkInDate,
        checkOutDate,
        rejectionReason: rejectionReason || 'ID verification failed',
      });
    }
    
    if (!result.success) {
      console.error('Failed to send status email:', result.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${status} email sent successfully` 
    });
    
  } catch (error) {
    console.error('Status email error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
