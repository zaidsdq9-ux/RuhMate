import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'About — RuhMate',
  description:
    'RuhMate is a matrimonial platform created exclusively for Sri Lankan Muslims — private, family-oriented, and guided by Islamic values.',
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About us"
      title="Finding a righteous life partner, made simple"
      lede="Welcome to RuhMate, a matrimonial platform created exclusively for Sri Lankan Muslims, where finding a righteous life partner is made simple, private, and guided by Islamic values."
    >
      <p>
        We understand that the journey towards marriage can often feel difficult and
        overwhelming. Many people rely on brokers, WhatsApp groups, Facebook communities, and
        endless searching just to find a suitable match. The process can take months or even
        years. Our mission is to change that.
      </p>
      <p>
        At RuhMate, we provide a secure, private, and family-oriented platform designed to
        create genuine matrimonial connections. With no unnecessary social media exposure, no
        public photo sharing, and no direct messaging, we offer a respectful environment that
        helps individuals and families connect in the most halal and meaningful way.
      </p>

      <h2>Why Choose RuhMate?</h2>

      <h3>Privacy &amp; Trust First</h3>
      <p>
        Your privacy and dignity are our highest priority. Every profile goes through a careful
        verification process with family involvement. Parents, guardians, or close family
        members are contacted for approval to ensure transparency and authenticity. Profiles
        without proper family consent may be removed from the platform.
      </p>

      <h3>AI-Powered Match Suggestions</h3>
      <p>
        Our advanced AI-powered system carefully analyzes your profile preferences, values,
        interests, education, lifestyle, and compatibility factors to suggest suitable matches
        tailored specifically for you. Instead of endless searching, RuhMate helps you discover
        meaningful connections intelligently, while still maintaining privacy, modesty, and
        Islamic boundaries throughout the process.
      </p>

      <h3>Simple &amp; User-Friendly</h3>
      <p>
        RuhMate is designed to be easy for everyone to use. No complicated steps or distractions
        — just a clean and seamless experience focused on finding the right life partner.
      </p>

      <h3>Affordable &amp; Transparent</h3>
      <p>
        Avoid expensive broker fees and hidden costs. Our platform is built to be affordable,
        honest, and accessible, allowing you to focus on what truly matters: building a blessed
        future together.
      </p>

      <p>
        At RuhMate, we are committed to helping Muslims across Sri Lanka and around the world
        find compatible spouses in a manner that aligns with our faith, culture, and values.
      </p>
      <p>
        Whether you are beginning your marriage journey or have been searching for some time, we
        are here to make the process easier, safer, and more meaningful — InshaAllah.
      </p>
    </ContentPage>
  );
}
