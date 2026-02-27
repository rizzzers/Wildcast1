import Link from 'next/link';
import { NavBar } from '@/components/NavBar';

export const metadata = {
  title: 'Privacy Policy — Howdi',
  description: 'How Howdi collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      <section className="pt-40 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-500 mb-6">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: February 2026</p>

          <div className="space-y-10 text-gray-400 leading-relaxed">

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">When you use Howdi, we collect information you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>Your name and email address when you create an account</li>
                <li>Podcast information (name, URL, description, category)</li>
                <li>Survey responses about your audience and content</li>
                <li>Outreach activity and email send history</li>
                <li>Payment information processed securely through Stripe</li>
              </ul>
              <p className="mt-3">We also collect limited usage data automatically, such as pages visited, features used, and browser type, to improve the product.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>Match your podcast with relevant brand partners</li>
                <li>Generate and personalize outreach email templates</li>
                <li>Send product updates and relevant communications</li>
                <li>Process payments and manage your subscription</li>
                <li>Improve matching accuracy and product features</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-3">We do not sell your personal information to third parties.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">3. Data Sharing</h2>
              <p className="mb-3">We share your information only with:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li><strong className="text-gray-300">Service providers</strong> — such as hosting, payment processing (Stripe), and email delivery that help us operate the platform</li>
                <li><strong className="text-gray-300">OpenAI</strong> — to generate AI-powered match scores and email templates (your data is not used to train their models under our API agreement)</li>
                <li><strong className="text-gray-300">Legal authorities</strong> — when required by law or to protect rights and safety</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">4. Gmail Integration</h2>
              <p>If you connect your Gmail account, we request permission to send emails on your behalf. We do not read, store, or index your existing emails. Gmail access is used solely to send outreach emails you compose within Howdi. You can disconnect Gmail at any time from your profile settings.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
              <p>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where retention is required for legal or financial compliance purposes.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">6. Security</h2>
              <p>We use industry-standard security practices to protect your data, including encrypted storage and secure HTTPS connections. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 ml-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Export your data in a portable format</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">8. Cookies</h2>
              <p>We use essential cookies to keep you signed in and maintain session state. We do not use third-party advertising cookies or cross-site tracking.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
              <p>Howdi is not directed at children under 13. We do not knowingly collect personal information from anyone under 13 years of age.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice in the app. Continued use of Howdi after changes take effect constitutes your acceptance of the updated policy.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
              <p>If you have questions about this Privacy Policy or how we handle your data, please reach out through the contact form on our site.</p>
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
