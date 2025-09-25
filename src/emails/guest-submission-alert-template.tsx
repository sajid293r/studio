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

interface GuestSubmissionAlertProps {
  propertyName: string;
  guestName: string;
  bookingId: string;
  submissionUrl: string;
}

export const GuestSubmissionAlertTemplate = ({
  propertyName,
  guestName,
  bookingId,
  submissionUrl,
}: GuestSubmissionAlertProps) => (
  <Html>
    <Head />
    <Preview>New guest submission for {propertyName} - Booking {bookingId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>🔔 New Guest Submission</Heading>
          
          <Text style={text}>
            You have received a new guest submission for your property.
          </Text>
          
          <Section style={alertBox}>
            <Text style={alertTitle}>Submission Details:</Text>
            <Text style={alertText}>
              <strong>Property:</strong> {propertyName}
            </Text>
            <Text style={alertText}>
              <strong>Guest Name:</strong> {guestName}
            </Text>
            <Text style={alertText}>
              <strong>Booking ID:</strong> {bookingId}
            </Text>
            <Text style={alertText}>
              <strong>Status:</strong> <span style={pendingStatus}>Pending Review</span>
            </Text>
          </Section>
          
          <Text style={text}>
            The guest has completed their check-in form and submitted their ID documents. 
            Please review the submission and take any necessary action.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={submissionUrl}>
              Review Submission
            </Button>
          </Section>
          
          <Text style={text}>
            You can also access this submission from your dashboard under the submissions section.
          </Text>
          
          <Text style={text}>
            <strong>Important:</strong> Please review guest submissions promptly to ensure a smooth check-in process.
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

const alertBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const alertTitle = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const alertText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const pendingStatus = {
  color: '#ffc107',
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

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
};

export default GuestSubmissionAlertTemplate;
