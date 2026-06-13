import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'AI Matching — RuhMate',
  description:
    'How RuhMate uses AI to rank the most compatible profiles for you — privately, without ever sharing your contact details.',
  robots: { index: true, follow: true },
};

export default function AiMatchingPage() {
  return (
    <ContentPage
      eyebrow="AI matching"
      title="Matches ranked by genuine compatibility"
      lede="Instead of endless scrolling and filtering, RuhMate reads what you’re actually looking for and brings the most compatible profiles to the top of your feed."
    >
      <h2>Describe your ideal match in your own words</h2>
      <p>
        On your profile you write a short, free-text description of the partner and life you’re
        hoping for. There’s no rigid form to wrestle with — just say what matters to you, in
        plain language.
      </p>

      <h2>The AI understands meaning, not just keywords</h2>
      <p>
        Your description and each profile are converted into a mathematical representation of
        their meaning. RuhMate then measures how closely profiles align with your preferences —
        so a thoughtful description surfaces genuinely relevant people, even when the exact words
        differ.
      </p>

      <h2>Your feed, intelligently ordered</h2>
      <p>
        The most compatible matches appear first in a dedicated section, while you can still
        browse the wider feed and apply filters like age, location, and background. You stay in
        control; the AI simply saves you time.
      </p>

      <h2>Privacy comes first</h2>
      <p>
        Compatibility is calculated only from your structured profile and preference text. Your
        name, phone number, email, and other contact details are <strong>never</strong> sent to
        any AI service. Matching never compromises your privacy.
      </p>

      <h2>Guidance, not a guarantee</h2>
      <p>
        AI suggestions are a tool to help you discover compatible people more efficiently. The
        decision — made with your family, and with proper verification — always remains yours.
      </p>
    </ContentPage>
  );
}
