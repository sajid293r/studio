
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted/40 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                 <Link href="/" className="flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">Stay Verify</span>
                </Link>
            </div>
        </header>
        <main className="flex-1 container py-12 md:py-24">
            <div className="prose prose-lg mx-auto dark:prose-invert">
                <h1>Privacy Policy for Stay Verify</h1>
                <p className="lead">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>
                <p>
                    This Privacy Policy describes how MYKA STAYS ("Stay Verify", "we", "us", or "our") collects, uses, processes, and discloses your information in relation to your access to and use of the Stay Verify services. This policy is drafted in compliance with applicable data protection regulations, including the EU General Data Protection Regulation (GDPR) and India's Digital Personal Data Protection Act, 2023 (DPDPA).
                </p>

                <h2>1. Data Fiduciary & Contact Information</h2>
                <p>
                    For the purpose of this policy, the Data Fiduciary (equivalent to a "Data Controller" under GDPR) responsible for your personal information is:
                </p>
                <p>
                    <strong>MYKA STAYS</strong><br />
                    SHOP NO 6, Second Floor, Karma Point,<br />
                    Vasco da Gama, Goa 403802, India
                </p>
                <p>
                    If you have any questions about this Privacy Policy or our information handling practices, you can contact us at:
                </p>
                <ul>
                    <li><strong>Email:</strong> sales@stayverify.com</li>
                    <li><strong>Mobile:</strong> +91 8793869171</li>
                </ul>

                <h2>2. Information We Collect</h2>
                <p>
                    We collect different types of information depending on your role (Property Owner or Guest).
                </p>
                <h3>2.1 For Property Owners (Our Clients)</h3>
                <p>
                    As a Property Owner using our Service, we collect information necessary to provide you with our services. We act as the Data Fiduciary for this information.
                </p>
                <ul>
                    <li><strong>Identity & Account Data:</strong> Name, email address, phone number, and account credentials.</li>
                    <li><strong>Property Data:</strong> Property name, address, contact details, and brand logo.</li>
                    <li><strong>Transaction Data:</strong> Subscription plan details and payment information. Please note, we use Razorpay as our payment processor, and we do not store your full credit card or bank account details.</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, and usage information on our platform.</li>
                </ul>
                <h3>2.2 For Guests of Property Owners</h3>
                <p>
                    When a Property Owner uses our service to verify their guests, we process guest information on behalf of the Property Owner. In this context, the **Property Owner is the Data Fiduciary**, and **Stay Verify acts as the Data Processor**.
                </p>
                <ul>
                    <li><strong>Identification Data:</strong> Government-issued identification documents (e.g., Passport, Aadhar, Driving License) uploaded by the guest.</li>
                    <li><strong>Extracted Data:</strong> Information extracted from the ID documents, such as name, date of birth, and ID number, for verification purposes.</li>
                </ul>

                <h2>3. Purpose and Legal Basis for Processing Data</h2>
                <p>We use your data for specific, explicit, and lawful purposes.</p>
                <ul>
                    <li><strong>To Provide the Service (Performance of Contract):</strong> We process Property Owner data to create accounts, manage subscriptions, and provide access to our dashboard. We process Guest data on behalf of the Property Owner to fulfill their need for identity verification.</li>
                    <li><strong>For Legitimate Interests:</strong> To improve our service, provide customer support, and for security monitoring to prevent fraud.</li>
                    <li><strong>To Comply with Legal Obligations:</strong> To meet legal requirements and respond to lawful requests from authorities.</li>
                    <li><strong>With Your Consent:</strong> We rely on the Property Owner to obtain the lawful consent from their Guests for the collection and processing of their ID documents for verification purposes.</li>
                </ul>

                <h2>4. Data Retention and Deletion</h2>
                <p>
                    We retain data only for as long as necessary.
                </p>
                <ul>
                    <li><strong>Property Owner Data:</strong> We retain your account information as long as you have an active subscription and for a reasonable period thereafter to comply with our legal and financial obligations.</li>
                    <li><strong>Guest Data:</strong> All guest identification documents and any data extracted from them are **automatically and permanently deleted from our systems 60 days after the guest's specified check-out date**. This is a critical security and compliance feature of our service.</li>
                </ul>

                <h2>5. Your Rights as a Data Subject</h2>
                <p>Under GDPR and DPDPA, you have certain rights regarding your personal data:</p>
                <ul>
                    <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> You have the right to correct any inaccurate or incomplete information.</li>
                    <li><strong>Right to Erasure ('Right to be Forgotten'):</strong> You can request the deletion of your personal data, subject to our legal and contractual obligations.</li>
                    <li><strong>Right to Restrict Processing:</strong> You can request that we limit the processing of your data under certain conditions.</li>
                    <li><strong>Right to Data Portability:</strong> You can request to receive your data in a structured, commonly used, and machine-readable format.</li>
                    <li><strong>Right to Grievance Redressal:</strong> You have the right to have any grievances addressed.</li>
                </ul>
                <p>To exercise these rights, please contact us using the details in Section 1. If you are a Guest, please direct your request to the Property Owner (the Data Fiduciary) first.</p>

                <h2>6. Data Security</h2>
                <p>
                    We implement robust technical and organizational measures to protect your data, including encryption, access controls, and secure storage on Firebase (Google Cloud) infrastructure. However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2>7. Third-Party Service Providers (Data Processors)</h2>
                <p>
                    We use trusted third-party service providers to help us deliver our services:
                </p>
                <ul>
                    <li><strong>Google Cloud / Firebase:</strong> For application hosting, database, storage, and authentication.</li>
                    <li><strong>Razorpay:</strong> For secure payment processing for subscriptions.</li>
                </ul>
                <p>These providers are bound by their own privacy and security obligations.</p>

                <h2>8. Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and, where appropriate, through email. We encourage you to review this policy periodically.
                </p>
            </div>
        </main>
        <footer className="bg-background py-6 mt-auto">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Stay Verify. All rights reserved.</p>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:underline underline-offset-4">Terms of Service</Link>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:underline underline-offset-4">Privacy Policy</Link>
                    <Link href="/contact-us" className="text-sm text-muted-foreground hover:underline underline-offset-4">Contact Us</Link>
                    <Link href="/cancellations-and-refunds" className="text-sm text-muted-foreground hover:underline underline-offset-4">Cancellations & Refunds</Link>
                </div>
            </div>
        </footer>
    </div>
  );
}
