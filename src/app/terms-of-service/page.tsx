
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
                <h1>Terms & Conditions – Verify Stay (India Region)</h1>

                <p className="lead">Welcome to <strong>Verify Stay</strong>, a guest verification portal (the “Portal”) owned and managed by <strong>MYKA Stays</strong>, having its registered office at:</p>

                <p>
                    <strong>MYKA Stays</strong><br />
                    Shop No. 6, Second Floor, Karma Point,<br />
                    Vasco da Gama, Goa 403802, India.
                </p>

                <p>These Terms and Conditions (“Terms”), as amended from time to time, constitute a legally binding agreement between you (the “Client”, “Customer”, or “User”) and MYKA Stays (“Company”, “we”, “us”, or “our”) governing the use of the Verify Stay Portal and related services (“Services”). By subscribing to or using the Portal, you acknowledge and agree that you have read, understood, and accepted these Terms.</p>

                <hr />

                <h2>1. Scope of Services</h2>
                <ul>
                    <li>Verify Stay provides an online platform for <strong>guest identity verification and compliance checks</strong>.</li>
                    <li>The Services are accessible only to Clients who have purchased a subscription package.</li>
                    <li>Information provided by Clients must be <strong>true, accurate, and complete</strong>, and the Client is solely responsible for any consequences of false or misleading data.</li>
                </ul>

                <hr />

                <h2>2. Subscription & Packages</h2>
                <ul>
                    <li>Clients may subscribe to <strong>6-month or annual packages</strong> (the “Subscription”).</li>
                    <li>The Subscription commences on the date of purchase and remains valid for the duration of the package selected.</li>
                    <li>Services are accessible only during the active Subscription term. Renewal is required to continue access.</li>
                </ul>

                <hr />

                <h2>3. Payments & Non-Refundability</h2>
                <ul>
                    <li>All payments must be made in advance through the Company’s approved payment methods.</li>
                    <li><strong>All Subscription fees are strictly non-refundable</strong>, irrespective of usage, cancellation, or early termination by the Client.</li>
                    <li>The Client agrees to bear any applicable taxes, levies, or surcharges at the time of payment.</li>
                    <li>Failure to pay within the stipulated time may result in suspension or termination of Services without liability on the Company.</li>
                </ul>

                <hr />

                <h2>4. No Chargeback Policy</h2>
                <ul>
                    <li>By making a payment, the Client acknowledges and agrees that <strong>all transactions are final and not subject to chargebacks</strong>.</li>
                    <li>The Client shall not initiate or pursue any chargeback, reversal, or dispute with their bank, card issuer, or payment gateway once payment is successfully made.</li>
                    <li>In the event of an attempted chargeback, the Company reserves the right to:
                        <ul>
                            <li>Suspend or terminate the Client’s account and access to Services immediately.</li>
                            <li>Recover any disputed amounts, including associated costs, through legal remedies available under Indian law.</li>
                        </ul>
                    </li>
                    <li>This clause is enforceable in addition to the <strong>Non-Refundability</strong> provisions in Section 3.</li>
                </ul>

                <hr />

                <h2>5. Client Obligations</h2>
                <ul>
                    <li>Clients must use the Portal solely for lawful verification purposes.</li>
                    <li>Misuse of the Portal, fraudulent activity, or non-compliance with Indian laws will result in suspension or termination without refund.</li>
                    <li>Clients are responsible for maintaining the confidentiality of account credentials and all activity under their accounts.</li>
                </ul>

                <hr />

                <h2>6. Data Privacy & Security</h2>
                <ul>
                    <li>The Company collects and processes identification documents and related data strictly for verification purposes.</li>
                    <li>Data will be handled in compliance with applicable Indian data protection laws.</li>
                    <li>The Company employs reasonable safeguards but shall not be liable for breaches beyond its control (e.g., cyberattacks).</li>
                </ul>

                <hr />

                <h2>7. Limitation of Liability</h2>
                <ul>
                    <li>The Company provides Services on an “as-is” basis and does not guarantee uninterrupted availability or absolute accuracy of third-party verification databases.</li>
                    <li>The Company shall not be responsible for disputes between Clients, property owners, or guests.</li>
                    <li>To the maximum extent permitted by Indian law, the Company disclaims liability for indirect, incidental, or consequential damages.</li>
                </ul>

                <hr />

                <h2>8. Term & Termination</h2>
                <ul>
                    <li>Subscriptions terminate automatically at the end of the purchased term unless renewed.</li>
                    <li>The Company reserves the right to suspend or terminate Services for violations of these Terms.</li>
                    <li>No refunds or credits shall be provided upon termination.</li>
                </ul>

                <hr />

                <h2>9. Governing Law & Jurisdiction</h2>
                <ul>
                    <li>These Terms are governed by the <strong>laws of India</strong>.</li>
                    <li>All disputes shall be subject to the <strong>exclusive jurisdiction of the courts in Goa, India</strong>.</li>
                </ul>

                <hr />

                <h2>10. Miscellaneous</h2>
                <ul>
                    <li>These Terms represent the entire agreement between the Client and the Company.</li>
                    <li>The Company may amend these Terms at its discretion. Updates will be posted on the Portal, and continued use of the Services shall be deemed acceptance.</li>
                    <li>If any provision is deemed unenforceable, the remaining provisions shall remain valid and enforceable.</li>
                </ul>

                <hr />

                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB')}</p>
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
