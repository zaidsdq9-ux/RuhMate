import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Refund Policy — RuhMate',
  description: 'How refunds work for points and membership payments on RuhMate.',
  robots: { index: true, follow: true },
};

export default function RefundsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Refund Policy"
      lede="This Refund Policy explains how payments for points and memberships are handled on RuhMate. It should be read together with our Terms & Conditions."
      cta={false}
    >
      <h2>1. Non-refundable by default</h2>
      <p>
        All membership and point purchases on RuhMate are non-refundable unless otherwise
        stated by RuhMate or required by applicable Sri Lankan law. Please review pack details
        carefully before making a payment.
      </p>

      <h2>2. Points that have been spent</h2>
      <p>
        Points that have already been used to unlock a profile’s contact details cannot be
        refunded, as the service — contact disclosure — has been delivered at that point.
      </p>

      <h2>3. Unused points</h2>
      <p>
        Points do not expire and remain available in your account for future use. Because they
        retain their value indefinitely, unused points are generally not eligible for a cash
        refund.
      </p>

      <h2>4. Duplicate or failed payments</h2>
      <p>
        If you were charged more than once for the same purchase, or were charged for points
        that were never credited to your account, contact us and we will investigate and
        correct any verified billing error.
      </p>

      <h2>5. How to request a review</h2>
      <p>
        To raise a billing concern, email{' '}
        <a href="mailto:support@ruhmate.lk">support@ruhmate.lk</a> with your account email and
        the payment reference. Requests are reviewed on a case-by-case basis.
      </p>

      <h2>6. Payment processing</h2>
      <p>
        Payments are processed by PayHere. Any approved refund is returned through the original
        payment method and may take several business days to appear, depending on your bank or
        card provider.
      </p>
    </ContentPage>
  );
}
