import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — RuhMate',
  description: 'How RuhMate collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <span className="chip chip-rose mb-4 inline-block">Legal</span>
          <h1 className="display text-4xl text-ink">Privacy Policy</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: 31 May 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="card space-y-10 p-8 sm:p-12">

          <Section title="Introduction">
            <p>
              RuhMate (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates
              ruhmate.lk, a halal matrimonial platform for Muslims seeking a serious marriage
              partner. We are committed to protecting your privacy and handling your personal
              information responsibly.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what information we collect when you use RuhMate,
              how we use it, who we may share it with, and how we keep it secure. By
              registering or using our platform, you agree to the practices described in this
              policy.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>We may collect the following types of information:</p>
            <ul className="mt-3 space-y-3 pl-5 list-disc text-ink-soft">
              <li>
                <strong>Account information</strong> — your name, email address, and
                password when you register.
              </li>
              <li>
                <strong>Profile details</strong> — age, gender, location (district/city),
                marital status, education, occupation, religious practice, and other
                fields you choose to fill in on your matrimonial profile.
              </li>
              <li>
                <strong>Partner preferences</strong> — your free-text description of the
                kind of partner you are looking for, used by our AI matching system to
                suggest relevant profiles.
              </li>
              <li>
                <strong>Contact details</strong> — phone number and/or WhatsApp number,
                provided voluntarily. These remain hidden unless another member uses
                platform points to unlock your contact.
              </li>
              <li>
                <strong>Payment-related information</strong> — transaction records including
                order ID, amount, payment status, and timestamp. We do{' '}
                <strong>not</strong> store full card numbers, CVV codes, or any sensitive
                card data. All card processing is handled securely by PayHere.
              </li>
              <li>
                <strong>Usage and device information</strong> — pages visited, features
                used, browser type, device type, and general activity on the platform,
                collected to understand how users interact with RuhMate and to improve
                the service.
              </li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Create and manage your account and matrimonial profile</li>
              <li>Operate the AI matching system to suggest potentially compatible profiles</li>
              <li>Process payments and maintain transaction records for your account</li>
              <li>Respond to support requests and communicate important account updates</li>
              <li>Improve platform features, performance, and the overall user experience</li>
              <li>Detect and prevent fraud, misuse, fake profiles, and policy violations</li>
              <li>Maintain the safety and integrity of the platform and its community</li>
              <li>Comply with legal obligations where applicable</li>
            </ul>
          </Section>

          <Section title="Payment Information">
            <p>
              All payment transactions on RuhMate are processed through{' '}
              <strong>PayHere</strong>, a trusted Sri Lankan payment gateway. When you make
              a payment, your card details are entered directly on PayHere&rsquo;s secure
              payment page and are not transmitted to or stored by RuhMate.
            </p>
            <p className="mt-3">
              RuhMate only retains non-sensitive payment metadata — such as order ID, amount
              paid, payment status, and transaction date — for account management,
              transaction history, and support purposes.
            </p>
          </Section>

          <Section title="Profile and Matching Information">
            <p>
              Your matrimonial profile is visible to other registered and verified members of
              RuhMate. By default, your <strong>contact details are hidden</strong> and are
              only revealed to a member who uses platform points to unlock your profile.
            </p>
            <p className="mt-3">
              Your partner preference description is used by our AI system to rank and suggest
              profiles. It is not displayed publicly on your profile and is used only for
              matching purposes.
            </p>
          </Section>

          <Section title="Information Sharing">
            <p>
              We <strong>do not sell</strong> your personal information to third parties. Your
              data may be shared only in the following limited situations:
            </p>
            <ul className="mt-3 space-y-3 pl-5 list-disc text-ink-soft">
              <li>
                <strong>Payment processors</strong> — PayHere, to complete your payment
                transactions.
              </li>
              <li>
                <strong>Cloud and infrastructure providers</strong> — trusted service providers
                such as Google (Firebase), Vercel, and Resend, who help us run and deliver
                the platform. These providers are bound by their own data protection obligations.
              </li>
              <li>
                <strong>Legal requirements</strong> — if required by applicable law, court
                order, or government authority, or to protect the rights, safety, or property
                of RuhMate, our users, or the public.
              </li>
            </ul>
          </Section>

          <Section title="Data Security">
            <p>
              We take the security of your data seriously. RuhMate implements
              industry-standard security measures including:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>HTTPS encryption for all data in transit</li>
              <li>Firebase Authentication and security rules to protect account access</li>
              <li>Server-side token verification for all sensitive operations</li>
              <li>Restricted access to production data — only authorised personnel can access it</li>
            </ul>
            <p className="mt-4">
              While we take reasonable precautions, no online system can guarantee absolute
              security. We encourage you to use a strong password and keep your account
              credentials confidential.
            </p>
          </Section>

          <Section title="Cookies and Analytics">
            <p>
              RuhMate uses cookies and similar technologies to maintain your login session and
              remember your preferences. We may also collect anonymous usage analytics to
              understand how users navigate the platform and to identify areas for improvement.
            </p>
            <p className="mt-3">
              Analytics data is used only in aggregate form and is not linked to individual
              identities. We do not use cookies to track you across other websites.
            </p>
            <p className="mt-3">
              You may disable cookies in your browser settings, but doing so may affect your
              ability to log in or use certain features of the platform.
            </p>
          </Section>

          <Section title="User Rights / Account Deletion">
            <p>
              You have the right to access, correct, or request deletion of your personal
              data. To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@ruhmate.lk" className="text-rose hover:underline">
                support@ruhmate.lk
              </a>
              . Specifically, you may:
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-ink-soft">
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request correction of inaccurate or outdated information</li>
              <li>Request deletion of your account and associated profile data</li>
              <li>Ask questions about how your information is handled</li>
            </ul>
            <p className="mt-4">
              Upon account deletion, your profile will be removed from the active platform.
              Some transaction and audit records may be retained as required by applicable law
              or for legitimate business purposes.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices or applicable law. When we do, we will update the &ldquo;Last
              updated&rdquo; date at the top of this page. Continued use of RuhMate after
              changes are posted constitutes your acceptance of the revised policy.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy or how we handle
              your data, please contact us:
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
          <Link href="/return-policy" className="hover:text-rose transition-colors">Refund Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-rose transition-colors">Terms &amp; Conditions</Link>
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
