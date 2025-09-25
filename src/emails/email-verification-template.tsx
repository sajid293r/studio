import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface EmailVerificationProps {
  name: string;
  verificationUrl: string;
}

export const EmailVerificationTemplate = ({
  name,
  verificationUrl,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address to complete your Stay Verify registration</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>Verify Your Email Address</Heading>
          
          <Text style={text}>Hello {name},</Text>
          
          <Text style={text}>
            Welcome to Stay Verify! Please verify your email address to complete your registration and start managing your properties.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          <Text style={link}>{verificationUrl}</Text>
          
          <Text style={text}>
            This verification link will expire in 24 hours for security reasons.
          </Text>
          
          <Text style={text}>
            If you didn't create an account with Stay Verify, please ignore this email.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Stay Verify Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

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

const box = {
  padding: '0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
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
  backgroundColor: '#007ee6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
};

const link = {
  color: '#007ee6',
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
};

export default EmailVerificationTemplate;
