import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email-service';
import { rateLimitConfig } from '@/lib/email-config';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  page_url: z.string().url().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

// Rate limiting function
function checkRateLimit(ip: string, type: 'contactForm' | 'emailVerification'): boolean {
  const now = Date.now();
  const key = `${ip}:${type}`;
  const config = type === 'contactForm' ? rateLimitConfig.contactForm : rateLimitConfig.emailVerification;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return true;
  }
  
  if (current.count >= config.maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip, 'contactForm')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = contactSchema.parse(body);
    
    // Send email
    const result = await emailService.sendContactForm({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      pageUrl: validatedData.page_url,
      utm: {
        source: validatedData.utm_source,
        medium: validatedData.utm_medium,
        campaign: validatedData.utm_campaign,
      },
    });
    
    if (!result.success) {
      console.error('Contact form email failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
