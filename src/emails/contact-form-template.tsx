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

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  pageUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export const ContactFormTemplate = ({
  name,
  email,
  subject,
  message,
  pageUrl,
  utm,
}: ContactFormEmailProps) => (
  <Html>
    <Head />
    <Preview>New contact form submission from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>New Contact Form Submission</Heading>
          
          <Text style={text}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={text}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={text}>
            <strong>Subject:</strong> {subject}
          </Text>
          
          <Text style={text}>
            <strong>Message:</strong>
          </Text>
          <Section style={messageBox}>
            <Text style={messageText}>{message}</Text>
          </Section>
          
          <Text style={text}>
            Please respond to this inquiry as soon as possible.
          </Text>
          
          {(pageUrl || utm) && (
            <>
              <Text style={text}>
                <strong>Additional Information:</strong>
              </Text>
              {pageUrl && (
                <Text style={text}>
                  <strong>Page URL:</strong> {pageUrl}
                </Text>
              )}
              {utm && (utm.source || utm.medium || utm.campaign) && (
                <Text style={text}>
                  <strong>UTM Tracking:</strong>
                  {utm.source && ` Source: ${utm.source}`}
                  {utm.medium && ` | Medium: ${utm.medium}`}
                  {utm.campaign && ` | Campaign: ${utm.campaign}`}
                </Text>
              )}
            </>
          )}
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
  backgroundColor: '#f4f4f4',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const messageText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

export default ContactFormTemplate;
