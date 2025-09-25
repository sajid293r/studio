import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactFormConfirmationProps {
  name: string;
  subject: string;
  message: string;
}

export const ContactFormConfirmationTemplate = ({
  name,
  subject,
  message,
}: ContactFormConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Thank you for contacting Stay Verify - We'll get back to you soon!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>Thank You for Contacting Us!</Heading>
          
          <Text style={text}>Hello {name},</Text>
          
          <Text style={text}>
            Thank you for reaching out to Stay Verify. We have received your message and will get back to you as soon as possible.
          </Text>
          
          <Section style={messageBox}>
            <Text style={messageTitle}>Your Message Details:</Text>
            <Text style={messageText}>
              <strong>Subject:</strong> {subject}
            </Text>
            <Text style={messageText}>
              <strong>Message:</strong>
            </Text>
            <Text style={messageContent}>{message}</Text>
          </Section>
          
          <Text style={text}>
            Our team typically responds within 24 hours. If you have any urgent questions, 
            please feel free to call us at <strong>+91 87938 69171</strong>.
          </Text>
          
          <Text style={text}>
            We appreciate your interest in Stay Verify and look forward to assisting you!
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Stay Verify Team<br />
            <a href="mailto:support@stayverify.com" style={link}>support@stayverify.com</a>
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

const messageBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const messageTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const messageText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const messageContent = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  fontStyle: 'italic',
  whiteSpace: 'pre-wrap' as const,
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
};

const link = {
  color: '#007ee6',
  textDecoration: 'none',
};

export default ContactFormConfirmationTemplate;
