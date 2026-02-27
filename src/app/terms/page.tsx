import Link from 'next/link';
import { NavBar } from '@/components/NavBar';

export const metadata = {
  title: 'Terms of Service — Howdi',
  description: 'The terms and conditions governing your use of Howdi.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      <section className="pt-40 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-500 mb-6">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: February 2026</p>

          <div className="space-y-10 text-gray-400 leading-relaxed">

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Howdi (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and others who access the Service.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
              <p>Howdi is a podcast partner matching platform that connects podcasters with brand partners. The Service provides match recommendations, contact information, and outreach tools to help podcasters initiate brand relationships. Howdi facilitates introductions only — we are not a party to any partnership agreement formed between a podcaster and a brand.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">3. Accounts</h2>
              <p className="mb-3">To access certain features of the Service, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>Provide accurate and complete registration information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Be responsible for all activity that occurs under your account</li>
              </ul>
              <p className="mt-3">You must be at least 18 years old to create an account.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>Send unsolicited bulk emails or spam to contacts provided by Howdi</li>
                <li>Misrepresent your podcast, audience size, or identity</li>
                <li>Harvest or scrape contact information for purposes other than direct outreach</li>
                <li>Resell or redistribute contact data obtained through the Service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the integrity of the Service</li>
              </ul>
              <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">5. Contact Data</h2>
              <p>Contact information provided through the Service is intended solely for direct, one-to-one outreach related to podcast partnership opportunities. You may not share, resell, or use contact data for any purpose other than reaching out to potential brand partners for your podcast. Misuse of contact data may result in immediate account termination.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">6. Subscriptions and Payments</h2>
              <p className="mb-3">Howdi offers both free and paid subscription plans. By subscribing to a paid plan:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>You can cancel your subscription at any time from your account settings</li>
                <li>Refunds are handled on a case-by-case basis at our discretion</li>
              </ul>
              <p className="mt-3">All payments are processed securely through Stripe. We do not store your full payment card details.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are owned by Howdi and protected by copyright, trademark, and other intellectual property laws. You retain ownership of any content you submit (podcast information, custom templates), and grant Howdi a limited license to use it to provide the Service.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
              <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. We do not guarantee that match recommendations will result in successful partnerships, that contact information will always be current, or that the Service will be uninterrupted or error-free.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Howdi shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to lost profits, lost data, or business interruption. Our total liability shall not exceed the amount you paid us in the three months preceding the claim.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">10. Third-Party Services</h2>
              <p>The Service integrates with third-party services including Google (Gmail), OpenAI, and Stripe. Your use of these integrations is subject to those providers&apos; own terms and privacy policies. Howdi is not responsible for the practices of these third parties.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">11. Termination</h2>
              <p>We may terminate or suspend your account at any time, with or without cause or notice, if we believe you have violated these Terms. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination shall survive.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will provide reasonable notice of material changes via email or in-app notification. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">13. Governing Law</h2>
              <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration, except where prohibited by law.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">14. Contact</h2>
              <p>If you have questions about these Terms, please reach out through the contact form on our site.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer back link */}
      <div className="border-t border-white/[0.06] py-8 px-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors">← Back to Howdi</Link>
      </div>
    </div>
  );
}
