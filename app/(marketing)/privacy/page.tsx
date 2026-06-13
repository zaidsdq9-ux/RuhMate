import { ContentPage } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Privacy Policy — RuhMate',
  description:
    'How RuhMate collects, uses, stores, and protects your personal information.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      lede="This Privacy Policy applies between you, the User of this Website, and RuhMate, the owner and provider of this platform."
      cta={false}
    >
      <p>
        At RuhMate, we value your privacy and are committed to protecting your personal
        information with the highest level of care and responsibility. This Privacy Policy
        explains how we collect, use, store, and protect your information when you use our
        website and services.
      </p>
      <p>
        This Privacy Policy should be read together with our{' '}
        <a href="/terms">Terms &amp; Conditions</a>.
      </p>

      <h2>Information We Collect</h2>
      <p>
        When you register and create a profile on RuhMate, we may collect the following
        information:
      </p>

      <h3>Registration Information</h3>
      <ul>
        <li>Full Name</li>
        <li>Mobile Number</li>
        <li>Password</li>
      </ul>

      <h3>Profile Information</h3>
      <ul>
        <li>Gender</li>
        <li>Marital Status</li>
        <li>Ethnicity</li>
        <li>Date of Birth</li>
        <li>Short Bio</li>
        <li>Marriage Expectations</li>
        <li>Location</li>
        <li>Dress Code</li>
        <li>Height &amp; Weight</li>
        <li>Complexion</li>
      </ul>

      <h3>Education &amp; Professional Information</h3>
      <ul>
        <li>School / Educational Institute</li>
        <li>Education Level</li>
        <li>Field of Study</li>
        <li>Additional Educational Details</li>
        <li>Profession</li>
        <li>Job Description</li>
      </ul>

      <h3>Parent or Guardian Information</h3>
      <ul>
        <li>Name</li>
        <li>Occupation</li>
        <li>Birth Place</li>
        <li>Additional Details</li>
      </ul>

      <h3>Contact Information</h3>
      <ul>
        <li>Mobile Number</li>
        <li>WhatsApp Number</li>
        <li>Additional Contact Number</li>
        <li>Contact Person</li>
        <li>Email Address</li>
      </ul>

      <h3>Siblings Information</h3>
      <ul>
        <li>Number of Brothers &amp; Sisters</li>
        <li>Additional Family Information</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>
        The information collected is primarily used to help create meaningful and compatible
        matrimonial matches in a safe and halal environment.
      </p>
      <p>Your data may be used for:</p>
      <ul>
        <li>Creating and managing your profile</li>
        <li>Suggesting compatible matches using our AI-integrated matching system</li>
        <li>Improving user experience and platform performance</li>
        <li>Communicating important updates and support information</li>
        <li>Internal analytics, planning, and service improvements</li>
      </ul>
      <p>
        We do not encourage unnecessary interaction or exposure. Certain profile details can
        remain private until both parties mutually agree to proceed further.
      </p>

      <h2>Privacy &amp; Family Verification</h2>
      <p>At RuhMate, privacy and authenticity are extremely important to us.</p>
      <p>To maintain trust and transparency:</p>
      <ul>
        <li>Profiles may go through a family or guardian verification process</li>
        <li>Parents, guardians, or close family members may be contacted for approval</li>
        <li>Profiles without proper verification or approval may be restricted or removed</li>
      </ul>
      <p>We aim to ensure all users experience a respectful and secure matrimonial journey.</p>

      <h2>Data Security</h2>
      <p>
        We are committed to protecting your personal information against unauthorized access,
        misuse, alteration, or disclosure.
      </p>
      <p>
        Appropriate security measures and technologies are implemented to safeguard your data
        and maintain platform integrity.
      </p>

      <h2>Subscription Plans</h2>
      <p>
        RuhMate offers both free and paid membership plans with different levels of access and
        features.
      </p>
      <p>
        All new users may receive 40 free points to explore the platform before subscribing to
        a paid plan.
      </p>
      <p>
        Subscription pricing and features may change over time and will always be clearly
        communicated within the platform.
      </p>

      <h2>User Rights</h2>

      <h3>Account Deactivation</h3>
      <p>
        You may deactivate your account at any time. Once deactivated, your profile will no
        longer be visible to other users.
      </p>

      <h3>Access &amp; Deletion Requests</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Request access to the information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request permanent deletion of your account and personal data</li>
      </ul>

      <h2>Changes to This Privacy Policy</h2>
      <p>RuhMate reserves the right to update or modify this Privacy Policy at any time.</p>
      <p>
        Any updates will be posted on this page, and users are encouraged to review this policy
        regularly to stay informed about how their information is protected.
      </p>
      <p>By using RuhMate, you agree to the terms outlined in this Privacy Policy.</p>
    </ContentPage>
  );
}
