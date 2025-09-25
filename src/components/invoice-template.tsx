import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components';

interface InvoiceTemplateProps {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  basePrice: string;
  gstAmount: string;
  totalAmount: string;
  companyName: string;
  companyAddress: string;
  companyGstin: string;
}

export const InvoiceTemplate: React.FC<Readonly<InvoiceTemplateProps>> = ({
  invoiceNumber,
  invoiceDate,
  customerName,
  planName,
  basePrice,
  gstAmount,
  totalAmount,
  companyName,
  companyAddress,
  companyGstin,
}) => (
  <Html>
    <Head />
    <Preview>Invoice {invoiceNumber} from {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Tax Invoice</Heading>
        <Section>
          <Row>
            <Column>
              <Text style={paragraph}>
                <strong>{companyName}</strong>
                <br />
                {companyAddress}
                <br />
                GSTIN: {companyGstin}
              </Text>
            </Column>
          </Row>
        </Section>
        <Hr style={hr} />
        <Section>
          <Row>
            <Column style={column}>
              <Text style={paragraph}>
                <strong>Billed to:</strong>
                <br />
                {customerName}
              </Text>
            </Column>
            <Column style={column} align="right">
              <Text style={paragraph}>
                <strong>Invoice Number:</strong> {invoiceNumber}
                <br />
                <strong>Invoice Date:</strong> {invoiceDate}
              </Text>
            </Column>
          </Row>
        </Section>
        <Hr style={hr} />
        <Section>
          <Row style={tableHeader}>
            <Column style={tableCell}>Description</Column>
            <Column style={tableCell} align="right">Amount</Column>
          </Row>
          <Row>
            <Column style={tableCell}>
              Stay Verify Subscription - {planName}
            </Column>
            <Column style={tableCell} align="right">
              ₹{basePrice}
            </Column>
          </Row>
        </Section>
        <Hr style={hr} />
        <Section>
          <Row>
            <Column style={tableCell}>Subtotal</Column>
            <Column style={tableCell} align="right">₹{basePrice}</Column>
          </Row>
           <Row>
            <Column style={tableCell}>GST (18%)</Column>
            <Column style={tableCell} align="right">₹{gstAmount}</Column>
          </Row>
           <Row style={totalRow}>
            <Column style={totalCell}>
                <strong>Total Amount</strong>
            </Column>
            <Column style={totalCell} align="right">
                <strong>₹{totalAmount}</strong>
            </Column>
          </Row>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          This is a computer-generated invoice and does not require a signature.
          <br/>
          If you have any questions, please contact sales@stayverify.com.
        </Text>
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
  border: '1px solid #e6ebf1',
  borderRadius: '5px',
};

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '1.4',
  color: '#525f7f',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const column = {
  width: '50%',
  padding: '0 20px',
};

const tableHeader = {
  backgroundColor: '#f6f9fc',
  padding: '12px 20px',
};

const tableCell = {
  ...paragraph,
  padding: '8px 20px',
};

const totalRow = {
    backgroundColor: '#f6f9fc',
}

const totalCell = {
  ...paragraph,
  fontWeight: '700',
  padding: '12px 20px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  marginTop: '20px',
};
