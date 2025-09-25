import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Testing email service with:', email);
    
    // Test verification email
    const result = await emailService.sendEmailVerification({
      email: email,
      name: 'Test User',
      verificationToken: 'test-token-123',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send test email',
          details: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test email failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
