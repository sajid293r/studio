
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Stay Verify | Automated Guest ID Verification for Hotels',
  description: 'Secure, paperless, and automated ID verification for hotels, homestays, and serviced apartments. Streamline your guest check-in process with AI-powered verification.',
  keywords: ['guest verification', 'hotel check-in', 'ID verification', 'hospitality tech', 'Aadhar verification', 'KYC for hotels', 'automated check-in'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
            {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
