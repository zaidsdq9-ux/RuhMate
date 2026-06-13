import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Contact — RuhMate',
  description: 'Get in touch with the RuhMate team for support with profiles, points, or payments.',
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="We’re here to help"
      lede="Questions about your profile, points, payments, or verification? Reach out and our team will get back to you."
      cta={false}
    >
      <h2>Email</h2>
      <p>
        For all enquiries and support, email us at{' '}
        <a href="mailto:support@ruhmate.lk">support@ruhmate.lk</a>. We aim to respond within one
        business day.
      </p>

      <h2>Support hours</h2>
      <p>Sunday to Friday, 9:30 AM to 8:00 PM (Sri Lanka time).</p>

      <h2>Account help</h2>
      <p>
        If you need help with your account, please email us from the address linked to your
        RuhMate profile so we can verify your identity and assist you faster. For privacy and
        security, we will never ask for your password.
      </p>
    </ContentPage>
  );
}
