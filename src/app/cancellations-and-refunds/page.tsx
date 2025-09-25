
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CancellationsAndRefundsPage() {
  return (
    <div className="bg-muted/40 min-h-screen">
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
                <h1>Cancellations & Refunds Policy</h1>

                <p className="lead">
                    This policy outlines the terms for cancellation and refunds for subscription services provided by Stay Verify, a product of MYKA STAYS. By purchasing a subscription, you agree to these terms.
                </p>

                <hr />

                <h2>1. Subscription Fees are Non-Refundable</h2>
                <p>
                    All fees paid for any subscription plan (including but not limited to the 6-month and 12-month plans) are **strictly non-refundable**. This policy applies regardless of whether the service was used, and no refunds or credits will be provided for partially used periods.
                </p>
                <p>
                    Once a payment is made and a property is activated, the sale is final.
                </p>

                <hr />
                
                <h2>2. No Chargeback Policy</h2>
                <p>
                    As outlined in our <Link href="/terms-of-service">Terms of Service</Link>, clients agree not to initiate any chargebacks with their bank or payment provider for any reason. Since all sales are final and non-refundable, any attempt to initiate a chargeback will be considered a breach of our agreement.
                </p>
                <p>
                    We reserve the right to dispute any chargeback and take further action to recover the funds, including the suspension of your account and services.
                </p>

                <hr />

                <h2>3. Service Termination</h2>
                <p>
                    You may choose to stop using the service at any time. However, this will not entitle you to a refund for any prepaid subscription fees. Your service will remain active until the end of the paid subscription period.
                </p>
                <p>
                    If Stay Verify terminates your account due to a violation of our Terms of Service, no refund will be issued for any unused portion of your subscription.
                </p>

                <hr />

                <h2>4. Exceptional Circumstances</h2>
                <p>
                    Refunds will not be considered for reasons including, but not limited to:
                </p>
                <ul>
                    <li>Dissatisfaction with the service.</li>
                    <li>Failure to use the service.</li>
                    <li>Technical issues originating from the client's end.</li>
                    <li>A change of mind or business circumstances.</li>
                </ul>
                <p>
                   We stand behind our product and are committed to providing excellent support. If you are facing technical difficulties, please <Link href="/contact-us">contact our support team</Link> so we can assist you.
                </p>

                 <hr />

                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB')}</p>
            </div>
        </main>
    </div>
  );
}
