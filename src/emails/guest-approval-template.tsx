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

interface GuestApprovalTemplateProps {
  guestName: string;
  propertyName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
}

export const GuestApprovalTemplate = ({
  guestName = 'Guest',
  propertyName = 'Property',
  bookingId = 'BK-0000',
  checkInDate = '2024-01-01',
  checkOutDate = '2024-01-02',
}: GuestApprovalTemplateProps) => (
  <Html>
    <Head />
    <Preview>Your ID verification has been approved - {propertyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>✅ ID Verification Approved</Heading>
          
          <Text style={text}>
            Dear {guestName},
          </Text>
          
          <Text style={text}>
            Great news! Your ID verification for <strong>{propertyName}</strong> has been approved.
          </Text>
          
          <Section style={successBox}>
            <Text style={successTitle}>Booking Details:</Text>
            <Text style={successText}>
              <strong>Property:</strong> {propertyName}
            </Text>
            <Text style={successText}>
              <strong>Booking ID:</strong> {bookingId}
            </Text>
            <Text style={successText}>
              <strong>Check-in:</strong> {checkInDate}
            </Text>
            <Text style={successText}>
              <strong>Check-out:</strong> {checkOutDate}
            </Text>
          </Section>
          
          <Text style={text}>
            You're all set for your stay! Please arrive at the property during the check-in time.
          </Text>
          
          <Text style={text}>
            If you have any questions, please contact the property directly.
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

const successBox = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const successTitle = {
  color: '#155724',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const successText = {
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

export default GuestApprovalTemplate;
