import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Press Kit — RuhMate',
  description: 'Brand assets, key facts, and media contact for RuhMate.',
  robots: { index: true, follow: true },
};

export default function PressKitPage() {
  return (
    <ContentPage
      eyebrow="Press kit"
      title="Press & media"
      lede="Resources for journalists, partners, and community organisations writing about RuhMate."
      cta={false}
    >
      <h2>About RuhMate</h2>
      <p>
        RuhMate is an AI-powered matrimonial platform created exclusively for Sri Lankan
        Muslims. It offers an anonymous-by-default profile feed, AI-ranked compatibility, and
        private, point-gated contact reveal — with no public photos and no in-app chat — to help
        Muslims find a spouse the halal way.
      </p>

      <h2>Key facts</h2>
      <ul>
        <li>Category: Matrimonial / matchmaking platform</li>
        <li>Audience: Sri Lankan Muslims, at home and worldwide</li>
        <li>Approach: Privacy-first, family-oriented, Islamic values</li>
        <li>Technology: AI-ranked matching with privacy-preserving embeddings</li>
        <li>Based in: Sri Lanka 🇱🇰</li>
      </ul>

      <h2>Brand assets</h2>
      <p>
        Our logo is available in pink (for light backgrounds) and white (for dark backgrounds).
        For high-resolution logo files or brand guidance, please contact us — and kindly do not
        alter, recolour, or stretch the logo.
      </p>

      <h2>Media contact</h2>
      <p>
        For interviews, quotes, or media enquiries, email{' '}
        <a href="mailto:press@ruhmate.lk">press@ruhmate.lk</a>.
      </p>
    </ContentPage>
  );
}
