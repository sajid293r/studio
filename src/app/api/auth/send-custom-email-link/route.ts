import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';

// Email request schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email } = emailSchema.parse(body);
    
    // Generate a simple magic link (you can make this more sophisticated)
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?email=${encodeURIComponent(email)}&magic=true`;
    
    // Send custom email using your email service
    const result = await emailService.sendMagicLink({
      email,
      name: email.split('@')[0], // Use email prefix as name
      magicLink,
    });
    
    if (!result.success) {
      console.error('Custom email failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully. Please check your email.',
    });
    
  } catch (error) {
    console.error('Custom email error:', error);
    
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
