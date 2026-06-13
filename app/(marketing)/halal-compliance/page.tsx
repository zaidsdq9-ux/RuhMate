import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Halal Compliance — RuhMate',
  description:
    'How RuhMate is designed to keep the search for a spouse within Islamic boundaries — modesty, privacy, and family involvement.',
  robots: { index: true, follow: true },
};

export default function HalalCompliancePage() {
  return (
    <ContentPage
      eyebrow="Halal compliance"
      title="Designed to stay within Islamic boundaries"
      lede="RuhMate exists to help Sri Lankan Muslims marry in a way that honours our faith. Every part of the platform is built to protect modesty, privacy, and family involvement."
    >
      <h2>No profile photos</h2>
      <p>
        Profiles never display photographs. Members are considered on their character, values,
        education, and family background — not on appearance — which removes a common source of
        immodesty and superficial judgement.
      </p>

      <h2>No private chat</h2>
      <p>
        There is no in-app messaging. RuhMate is not a place for casual, unsupervised
        conversation between non-mahrams. Once a contact is unlocked, the next steps are meant
        to happen openly, with family involvement.
      </p>

      <h2>Anonymous by default</h2>
      <p>
        Your name and contact details remain hidden until you decide to reveal them. This guards
        your privacy and prevents your information from circulating publicly.
      </p>

      <h2>Family verification</h2>
      <p>
        Profiles may go through a verification process involving parents, guardians, or close
        family members. This keeps the community authentic and reflects the central role of
        family in a Muslim marriage.
      </p>

      <h2>Marriage intent only</h2>
      <p>
        RuhMate is strictly for those with a sincere intention towards marriage. Dating, casual
        relationships, and any conduct against Islamic values are not permitted and may lead to
        account removal.
      </p>

      <h2>Privacy in AI matching</h2>
      <p>
        Our AI ranks compatibility from your structured profile and preference description. Your
        personal contact details are never sent to AI services — modesty and privacy are
        preserved even in the technology that powers your matches.
      </p>

      <p>
        We strive to keep RuhMate a respectful, God-conscious space. If you ever feel something
        on the platform falls short of these principles, please let us know.
      </p>
    </ContentPage>
  );
}
