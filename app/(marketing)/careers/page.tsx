import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Careers — RuhMate',
  description: 'Help build a private, halal, AI-powered way for Sri Lankan Muslims to marry.',
  robots: { index: true, follow: true },
};

export default function CareersPage() {
  return (
    <ContentPage
      eyebrow="Careers"
      title="Build something that matters"
      lede="We’re a small team on a mission: to make finding a righteous life partner simple, private, and halal for Muslims in Sri Lanka and beyond."
      cta={false}
    >
      <h2>Why work with us</h2>
      <p>
        RuhMate sits at the intersection of faith, family, and thoughtful technology. The work
        is meaningful, the standards are high, and the impact is real — helping people take one
        of the most important steps of their lives.
      </p>

      <h2>How we work</h2>
      <ul>
        <li>Privacy and trust come before growth at any cost.</li>
        <li>We keep things simple, honest, and respectful of our users’ values.</li>
        <li>Small team, real ownership, direct impact.</li>
      </ul>

      <h2>Open roles</h2>
      <p>
        We don’t have any open positions advertised right now. If you believe in the mission and
        think you could help — in engineering, design, community, or support — we’d still love to
        hear from you.
      </p>

      <h2>Get in touch</h2>
      <p>
        Send a short note about yourself and what you’d like to work on to{' '}
        <a href="mailto:careers@ruhmate.lk">careers@ruhmate.lk</a>.
      </p>
    </ContentPage>
  );
}
