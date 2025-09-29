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

interface SubscriptionWelcomeProps {
  name: string;
  propertyName: string;
  planName: string;
}

export const SubscriptionWelcomeTemplate = ({
  name,
  propertyName,
  planName,
}: SubscriptionWelcomeProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {planName} Plan - {propertyName} is now active!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>🎉 Subscription Activated!</Heading>
          
          <Text style={text}>Hello {name},</Text>
          
          <Text style={text}>
            Great news! Your subscription for <strong>{propertyName}</strong> has been successfully activated.
          </Text>
          
          <Section style={subscriptionBox}>
            <Text style={subscriptionTitle}>Subscription Details:</Text>
            <Text style={subscriptionText}>
              <strong>Property:</strong> {propertyName}
            </Text>
            <Text style={subscriptionText}>
              <strong>Plan:</strong> {planName}
            </Text>
            <Text style={subscriptionText}>
              <strong>Status:</strong> <span style={activeStatus}>Active</span>
            </Text>
          </Section>
          
          <Text style={text}>
            You can now start creating guest check-in links and managing your property operations.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/properties`}>
              Manage Properties
            </Button>
          </Section>
          
          <Section style={featuresSection}>
            <Heading style={h2}>What's included in your plan:</Heading>
            <ul style={list}>
              <li style={listItem}>Unlimited guest check-in links</li>
              <li style={listItem}>Real-time submission tracking</li>
              <li style={listItem}>Guest data management</li>
              <li style={listItem}>Email notifications</li>
              <li style={listItem}>24/7 support</li>
            </ul>
          </Section>
          
          <Text style={text}>
            If you have any questions about your subscription or need help getting started, 
            our support team is here to help.
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

const subscriptionBox = {
  backgroundColor: '#e8f5e8',
  border: '1px solid #4caf50',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const subscriptionTitle = {
  color: '#2e7d32',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const subscriptionText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const activeStatus = {
  color: '#4caf50',
  fontWeight: 'bold',
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

export default SubscriptionWelcomeTemplate;
