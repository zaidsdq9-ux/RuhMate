import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'For Families — RuhMate',
  description:
    'RuhMate is built with families at the centre — private, verified, and respectful of the role parents and guardians play in a Muslim marriage.',
  robots: { index: true, follow: true },
};

export default function ForFamiliesPage() {
  return (
    <ContentPage
      eyebrow="For families"
      title="Built with families at the centre"
      lede="In our community, marriage is a family matter. RuhMate is designed so parents and guardians can be involved with confidence, dignity, and peace of mind."
    >
      <h2>A platform you can trust</h2>
      <p>
        There are no public photos, no open chat, and no social-media-style exposure. Profiles
        are anonymous by default, so your family’s privacy is protected throughout the search.
      </p>

      <h2>Verification and consent</h2>
      <p>
        Profiles may go through a verification process that involves parents, guardians, or close
        family members. Profiles without proper family consent may be removed. This keeps the
        community authentic and trustworthy.
      </p>

      <h2>Manage a profile on behalf of family</h2>
      <p>
        With the informed consent of the adult involved, a parent or guardian may help create
        and manage a profile — making it easy to take part in the search responsibly.
      </p>

      <h2>Connections lead back to family</h2>
      <p>
        When a contact is unlocked, the next steps are meant to happen openly, with families
        leading the conversation — in keeping with the Sunnah, not private unsupervised messaging.
      </p>

      <h2>Affordable and honest</h2>
      <p>
        No expensive broker fees and no hidden costs. A simple points system means you only pay
        to reveal the contacts that genuinely matter to your family.
      </p>
    </ContentPage>
  );
}
