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

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmailTemplate = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Stay Verify! Start managing your properties today</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>🎉 Welcome to Stay Verify!</Heading>
          
          <Text style={text}>Hello {name},</Text>
          
          <Text style={text}>
            Congratulations! Your email has been verified and your Stay Verify account is now active.
          </Text>
          
          <Text style={text}>
            You can now start managing your properties, create guest check-in links, and streamline your hospitality operations.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
              Go to Dashboard
            </Button>
          </Section>
          
          <Section style={featuresSection}>
            <Heading style={h2}>What you can do now:</Heading>
            <ul style={list}>
              <li style={listItem}>Add and manage your properties</li>
              <li style={listItem}>Create guest check-in links</li>
              <li style={listItem}>Track guest submissions</li>
              <li style={listItem}>Manage subscriptions and billing</li>
              <li style={listItem}>Access admin features (if applicable)</li>
            </ul>
          </Section>
          
          <Text style={text}>
            If you have any questions or need assistance, feel free to contact our support team.
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

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
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

const featuresSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const list = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
};

export default WelcomeEmailTemplate;
