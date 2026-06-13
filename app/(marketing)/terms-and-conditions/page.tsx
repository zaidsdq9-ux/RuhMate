import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions — RuhMate',
  description: 'Terms and conditions for using the RuhMate halal matrimonial platform.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <span className="chip chip-rose mb-4 inline-block">Legal</span>
          <h1 className="display text-4xl text-ink">Terms &amp; Conditions</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: 31 May 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="card space-y-10 p-8 sm:p-12">

          <Section title="Introduction">
            <p>
              Welcome to RuhMate. These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern
              your access to and use of the RuhMate platform, website (ruhmate.lk), and
              all related services (&ldquo;Platform&rdquo;). By registering an account or
              using the Platform, you agree to be bound by these Terms. If you do not agree,
              please do not use RuhMate.
            </p>
          </Section>

          <Section title="Eligibility">
            <p>To use RuhMate, you must:</p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Be at least 18 years of age</li>
              <li>Be a Muslim seeking a lawful, halal marriage</li>
              <li>Have the legal capacity to enter into this agreement</li>
              <li>Not be prohibited from using the Platform under applicable law</li>
            </ul>
            <p className="mt-4">
              You may not create an account on behalf of another person without their full
              knowledge and consent.
            </p>
          </Section>

          <Section title="Purpose of the Platform">
            <p>
              RuhMate is a <strong>halal matrimonial platform</strong> designed exclusively
              for Muslims who are seriously seeking a marriage partner. The Platform is
              intended to facilitate respectful introductions between members. It is not a
              social networking site, a dating app, or a platform for casual interaction.
            </p>
            <p className="mt-3">
              All use of RuhMate must be consistent with this purpose and with Islamic values
              of respect, honesty, and modesty.
            </p>
          </Section>

          <Section title="User Account Responsibilities">
            <p>You are responsible for:</p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Keeping your account credentials confidential and secure</li>
              <li>All activity that occurs under your account</li>
              <li>Updating your information if it changes</li>
              <li>Notifying us immediately if you believe your account has been compromised</li>
            </ul>
            <p className="mt-4">
              RuhMate is not liable for any loss or damage arising from your failure to
              protect your account credentials.
            </p>
          </Section>

          <Section title="Profile Accuracy">
            <p>
              You agree to provide <strong>accurate, truthful, and complete</strong>{' '}
              information when creating or updating your profile. This includes your name, age,
              gender, location, marital status, and all other profile fields.
            </p>
            <p className="mt-3">
              Providing false or misleading information, misrepresenting your identity, or
              impersonating another person is a serious violation of these Terms and may result
              in immediate account suspension or permanent removal.
            </p>
          </Section>

          <Section title="Acceptable Use">
            <p>
              You agree to use RuhMate respectfully, lawfully, and in good faith. The
              following are strictly prohibited:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Creating fake, duplicate, or misleading profiles</li>
              <li>Harassment, threats, intimidation, or disrespectful behaviour toward other members</li>
              <li>Sharing offensive, explicit, inappropriate, or unlawful content</li>
              <li>Using the Platform for commercial solicitation, spam, scamming, or fraud</li>
              <li>Attempting to access other users&rsquo; contact details through unauthorised means</li>
              <li>Reverse-engineering, scraping, or extracting data from the Platform</li>
              <li>Attempting to circumvent platform security, access controls, or payment systems</li>
              <li>Any activity that violates applicable Sri Lankan or international law</li>
            </ul>
          </Section>

          <Section title="Paid Services and Payments">
            <p>
              RuhMate offers optional paid features, including point packages that allow
              members to unlock the contact details of other verified users. The price for
              each paid feature is clearly displayed on the Platform before purchase.
            </p>
            <p className="mt-3">
              All payments are processed securely through <strong>PayHere</strong>, a trusted
              Sri Lankan payment gateway. RuhMate does not store your card details.
            </p>
            <p className="mt-3">
              Paid features and point packages are made available to your account immediately
              upon successful payment confirmation. RuhMate reserves the right to adjust
              pricing at any time. Price changes will not affect purchases already completed.
            </p>
          </Section>

          <Section title="Refund Reference">
            <p>
              Refund and cancellation requests are governed by our{' '}
              <Link href="/return-policy" className="text-rose hover:underline">
                Refund &amp; Cancellation Policy
              </Link>
              . All purchases of digital features on RuhMate are generally non-refundable
              once access has been activated. Refunds are reviewed on a case-by-case basis
              for eligible situations such as duplicate payment, accidental overcharge, or
              non-delivery of service.
            </p>
          </Section>

          <Section title="Matching and Communication Disclaimer">
            <p>
              RuhMate provides tools to help Muslims discover and connect with potential
              marriage partners. However, we make <strong>no guarantee</strong> of:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Finding a compatible match or receiving interest from other members</li>
              <li>Receiving a marriage proposal or achieving any specific relationship outcome</li>
              <li>The accuracy, truthfulness, or sincerity of other members&rsquo; profiles and intentions</li>
              <li>The quality, volume, or relevance of AI-suggested profile matches</li>
            </ul>
            <p className="mt-4">
              Users are solely responsible for their own decisions and interactions during and
              after using the Platform. RuhMate is a facilitation tool, not a guarantor of
              outcomes.
            </p>
          </Section>

          <Section title="Account Suspension or Termination">
            <p>
              RuhMate reserves the right to <strong>suspend, restrict, or permanently
              remove</strong> any account that violates these Terms, engages in prohibited
              conduct, or is found to be harmful to other members or the platform community.
              We may act without prior notice in serious cases.
            </p>
            <p className="mt-3">
              You may request deactivation of your own account at any time by contacting
              support. Deactivation does not automatically entitle you to a refund for any
              prior payments.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              All content, branding, design, code, and features on the RuhMate Platform are
              owned by or licensed to RuhMate. You may not copy, reproduce, distribute,
              reverse-engineer, or create derivative works from any part of the Platform
              without our express written permission.
            </p>
            <p className="mt-3">
              Content you submit to your profile (such as your bio or preferences) remains
              your own, but by submitting it you grant RuhMate a non-exclusive licence to
              display and use it to operate the Platform.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, RuhMate and its operators
              shall not be liable for:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Any indirect, incidental, or consequential damages arising from Platform use</li>
              <li>Actions, conduct, content, or representations of other members</li>
              <li>Loss of points, account access, or data due to circumstances beyond our reasonable control</li>
              <li>Any decisions made in reliance on information provided by other Platform users</li>
            </ul>
            <p className="mt-4">
              RuhMate&rsquo;s total liability to you for any claim shall not exceed the
              amount you paid to RuhMate in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              Your use of RuhMate is also governed by our{' '}
              <Link href="/privacy-policy" className="text-rose hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review it to
              understand how we collect, use, and protect your personal information.
            </p>
          </Section>

          <Section title="Changes to Terms">
            <p>
              We may update these Terms from time to time. When we do, we will revise the
              &ldquo;Last updated&rdquo; date at the top of this page. Continued use of
              RuhMate after updated Terms are posted means you accept the revised Terms. If
              you do not agree to the updated Terms, please stop using the Platform.
            </p>
            <p className="mt-3">
              These Terms are governed by the laws of Sri Lanka. Any disputes shall be
              subject to the jurisdiction of the courts of Sri Lanka.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have questions about these Terms, please contact us:
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
          <Link href="/return-policy" className="hover:text-rose transition-colors">Refund Policy</Link>
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
