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

    console.log('Testing email connection for:', email);

    // Test with a simple magic link email
    const result = await emailService.sendMagicLink({
      email,
      name: 'Test User',
      magicLink: 'https://stayverify.com/verify-magic-link?token=test123&email=' + encodeURIComponent(email),
    });

    if (result.success) {
      console.log('Email test successful:', result.messageId);
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      });
    } else {
      console.error('Email test failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: error.message || 'Email test failed' },
      { status: 500 }
    );
  }
}