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

interface GuestRejectionTemplateProps {
  guestName: string;
  propertyName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  rejectionReason?: string;
}

export const GuestRejectionTemplate = ({
  guestName = 'Guest',
  propertyName = 'Property',
  bookingId = 'BK-0000',
  checkInDate = '2024-01-01',
  checkOutDate = '2024-01-02',
  rejectionReason = 'ID verification failed',
}: GuestRejectionTemplateProps) => (
  <Html>
    <Head />
    <Preview>ID verification requires attention - {propertyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>⚠️ ID Verification Issue</Heading>
          
          <Text style={text}>
            Dear {guestName},
          </Text>
          
          <Text style={text}>
            We encountered an issue with your ID verification for <strong>{propertyName}</strong>.
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningTitle}>Booking Details:</Text>
            <Text style={warningText}>
              <strong>Property:</strong> {propertyName}
            </Text>
            <Text style={warningText}>
              <strong>Booking ID:</strong> {bookingId}
            </Text>
            <Text style={warningText}>
              <strong>Check-in:</strong> {checkInDate}
            </Text>
            <Text style={warningText}>
              <strong>Check-out:</strong> {checkOutDate}
            </Text>
          </Section>
          
          <Section style={issueBox}>
            <Text style={issueTitle}>Issue Details:</Text>
            <Text style={issueText}>
              {rejectionReason}
            </Text>
          </Section>
          
          <Text style={text}>
            <strong>Next Steps:</strong>
          </Text>
          <Text style={text}>
            1. Please contact the property directly to resolve this issue
          </Text>
          <Text style={text}>
            2. You may need to provide additional documentation
          </Text>
          <Text style={text}>
            3. Ensure your ID is clear and valid
          </Text>
          
          <Text style={text}>
            Please contact us as soon as possible to avoid any check-in delays.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The {propertyName} Team
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

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const warningTitle = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const warningText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const issueBox = {
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const issueTitle = {
  color: '#721c24',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const issueText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
};

export default GuestRejectionTemplate;
