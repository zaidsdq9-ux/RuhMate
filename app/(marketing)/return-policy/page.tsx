import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — RuhMate',
  description: 'RuhMate refund and cancellation policy for digital matrimonial services and paid features.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <span className="chip chip-rose mb-4 inline-block">Legal</span>
          <h1 className="display text-4xl text-ink">Refund &amp; Cancellation Policy</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: 31 May 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="card space-y-10 p-8 sm:p-12">

          <Section title="Introduction">
            <p>
              RuhMate (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a halal
              matrimonial platform offering digital profile services, AI-powered matching,
              contact visibility, and membership-related features. This policy explains how we
              handle refunds and cancellations for payments made on ruhmate.lk.
            </p>
            <p className="mt-3">
              Please read this policy carefully before making any purchase. By completing a
              payment on RuhMate, you acknowledge that you have read and agree to this policy.
            </p>
          </Section>

          <Section title="Digital Service Nature">
            <p>
              All services provided by RuhMate are <strong>digital in nature</strong>. This
              includes but is not limited to:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Point packages used to unlock contact details of other members</li>
              <li>Premium membership or profile visibility upgrades</li>
              <li>AI-enhanced matching features</li>
              <li>Any other paid access or feature activated within your account</li>
            </ul>
            <p className="mt-4">
              Because these are digital services that are activated and accessible immediately
              upon successful payment, they are <strong>generally non-refundable</strong> once
              access has been granted or the service has been delivered.
            </p>
          </Section>

          <Section title="Subscription / Paid Feature Payments">
            <p>
              When you purchase a paid feature or point package on RuhMate, the service is made
              available to your account immediately after payment confirmation. By proceeding with
              a payment, you acknowledge that:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>The digital service has been delivered at the time of purchase</li>
              <li>You have reviewed the pricing and feature details before confirming payment</li>
              <li>Payments are processed securely through our payment gateway, PayHere</li>
            </ul>
          </Section>

          <Section title="Refund Eligibility">
            <p>
              We review refund requests on a <strong>case-by-case basis</strong>. A refund{' '}
              <em>may</em> be considered in the following circumstances:
            </p>
            <ul className="mt-3 space-y-3 pl-5 list-disc text-ink-soft">
              <li>
                <strong>Duplicate payment</strong> — your account was charged more than once
                for the same order due to a technical error.
              </li>
              <li>
                <strong>Accidental overcharge</strong> — you were charged an amount that
                differs from the price displayed at checkout.
              </li>
              <li>
                <strong>Service not activated</strong> — payment was successfully collected but
                the paid feature or points were not credited to your account.
              </li>
              <li>
                <strong>Verified technical failure</strong> — a confirmed issue on our platform
                prevented you from accessing the paid service after payment was processed.
              </li>
            </ul>
          </Section>

          <Section title="Non-Refundable Situations">
            <p>Refunds will <strong>not</strong> be issued in the following cases:</p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Change of mind after a purchase has been completed</li>
              <li>Dissatisfaction with match results, profile quality, or platform outcomes</li>
              <li>Failure to find a suitable match or partner</li>
              <li>Unused points or features remaining in an account at the time of a refund request</li>
              <li>Account suspension or removal due to violation of our Terms &amp; Conditions</li>
              <li>Requests made after 14 days from the original transaction date</li>
            </ul>
          </Section>

          <Section title="Duplicate or Incorrect Payments">
            <p>
              If you believe you have been charged incorrectly or have experienced a duplicate
              transaction, please contact us immediately at{' '}
              <a href="mailto:support@ruhmate.lk" className="text-rose hover:underline">
                support@ruhmate.lk
              </a>{' '}
              with the following details:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Your registered email address</li>
              <li>Transaction date and amount</li>
              <li>Payment reference or order ID (if available)</li>
              <li>A description of the issue</li>
            </ul>
            <p className="mt-4">
              We will investigate and respond within <strong>3 business days</strong>.
            </p>
          </Section>

          <Section title="Cancellation of Subscription / Paid Access">
            <p>
              RuhMate does not currently offer recurring subscription billing. All purchases are
              one-time payments for a specific feature, point package, or access period.
            </p>
            <p className="mt-3">
              If you wish to cancel your account or stop using the platform, you may do so at
              any time by contacting our support team. Account cancellation does not
              automatically entitle you to a refund for any previous payments unless the
              circumstances meet the refund eligibility criteria above.
            </p>
          </Section>

          <Section title="Refund Processing Time">
            <p>
              If a refund is approved by RuhMate, the amount will be returned to your original
              payment method. Processing times vary depending on your bank and payment provider.
              Typically, approved refunds are reflected within{' '}
              <strong>7–14 business days</strong> from the approval date.
            </p>
            <p className="mt-3">
              RuhMate does not control processing times on the bank or payment provider side.
              If you have not received an approved refund after 14 business days, please contact
              your bank or reach out to us for a status update.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              To submit a refund request or for questions about this policy, contact our support
              team:
            </p>
            <div className="mt-4 rounded-xl bg-surface px-6 py-5 text-sm text-ink-soft">
              <p><strong>RuhMate Support</strong></p>
              <p className="mt-1">
                Email:{' '}
                <a href="mailto:support@ruhmate.lk" className="text-rose hover:underline">
                  support@ruhmate.lk
                </a>
              </p>
              <p className="mt-1">Website: ruhmate.lk</p>
            </div>
          </Section>

        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-ink-muted">
          <Link href="/privacy-policy" className="hover:text-rose transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-rose transition-colors">Terms &amp; Conditions</Link>
          <Link href="/" className="hover:text-rose transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink mb-3 pb-2 border-b border-line">{title}</h2>
      <div className="text-ink-soft leading-relaxed text-[15px]">{children}</div>
    </div>
  );
}
