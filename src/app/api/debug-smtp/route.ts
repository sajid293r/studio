import { NextRequest, NextResponse } from 'next/server';
import { fallbackEmailService } from '@/lib/email-fallback';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing SMTP connection...');
    
    // Test SMTP connection
    const isConnected = await fallbackEmailService.verifyConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection successful',
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          user: process.env.SMTP_USER || 'stayverifed@gmail.com',
          secure: false,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'SMTP connection failed',
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          user: process.env.SMTP_USER || 'stayverifed@gmail.com',
          secure: false,
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('SMTP debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        user: process.env.SMTP_USER || 'stayverifed@gmail.com',
        secure: false,
      }
    }, { status: 500 });
  }
}
