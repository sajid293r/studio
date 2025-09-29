import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { emailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Get submission details
    const submissionRef = doc(db, 'submissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    const submission = submissionDoc.data();
    
    // Get property owner details
    const userRef = doc(db, 'users', submission.userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Property owner not found' }, { status: 404 });
    }
    
    const user = userDoc.data();
    
    // Send alert email to property owner with direct link to submission review
    const submissionUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?submission=${submissionId}`;
    
    const result = await emailService.sendGuestSubmissionAlert({
      propertyOwnerEmail: user.email,
      propertyName: submission.propertyName,
      guestName: submission.mainGuestName,
      bookingId: submission.bookingId,
      submissionUrl: submissionUrl,
    });
    
    if (!result.success) {
      console.error('Failed to send submission alert:', result.error);
      return NextResponse.json({ error: 'Failed to send alert email' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Alert email sent successfully' 
    });
    
  } catch (error) {
    console.error('Submission alert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
