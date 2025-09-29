import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface MagicLinkTemplateProps {
  name: string;
  magicLink: string;
}

export const MagicLinkTemplate = ({
  name = 'User',
  magicLink = 'https://stayverify.com/login',
}: MagicLinkTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your magic link to sign in to Stay Verify</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://stayverify.com/logo.png"
              width="40"
              height="40"
              alt="Stay Verify"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Welcome to Stay Verify</Heading>
          
          <Text style={text}>
            Hi {name},
          </Text>
          
          <Text style={text}>
            Click the button below to sign in to your Stay Verify account. This link will expire in 24 hours.
          </Text>
          
          <Section style={buttonContainer}>
            <Link style={button} href={magicLink}>
              Sign In to Stay Verify
            </Link>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {magicLink}
          </Text>
          
          <Text style={text}>
            If you didn't request this sign-in link, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Stay Verify Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};

export default MagicLinkTemplate;
