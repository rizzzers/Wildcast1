import Link from 'next/link';
import { NavBar } from '@/components/NavBar';

export const metadata = {
  title: 'About — Howdi',
  description: 'Learn about Howdi and our mission to connect podcasters with the right partners.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--primary)] mb-6">
            About Howdi
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-8">
            We make the introduction.
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed font-light">
            Howdi exists because too many great podcasts never reach their potential — not because the content isn&apos;t good, but because the right connections were never made.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Mission */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our mission</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              Podcasters spend years building trust with their audiences. That trust has real value — and the brands that understand this are actively looking to invest in it. The problem is that these two groups rarely find each other efficiently.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg mt-4">
              Howdi bridges that gap. We match podcasters with brand partners based on real audience data, content tone, and format — then hand over direct contact details so you can build the relationship yourself. No middlemen. No revenue cuts. Just the introduction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Why we built this</h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              The standard advice for monetizing a podcast is to wait until you hit 10,000 downloads per episode, then apply to a marketplace and hope someone notices you. We think that&apos;s broken.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg mt-4">
              Niche podcasts with highly engaged audiences are often more valuable to the right brands than broad shows with passive listeners. The size threshold is a myth perpetuated by platforms that benefit from keeping podcasters dependent on them.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg mt-4">
              Howdi gives you the tools to reach out directly — whether you have 500 listeners or 500,000.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">How it works</h2>
            <div className="space-y-6">
              {[
                { num: '01', title: 'Tell us about your show', body: 'Seven questions about your podcast — category, audience size, tone, format, and goals. Takes two minutes.' },
                { num: '02', title: 'We find the right matches', body: 'Our matching engine analyzes your profile against hundreds of brands and surfaces the contacts most likely to be a genuine fit.' },
                { num: '03', title: 'You reach out directly', body: 'We hand you real names, direct emails, LinkedIn profiles, and outreach templates. The relationship is yours from the start.' },
              ].map(({ num, title, body }) => (
                <div key={num} className="flex gap-6 p-6 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50">
                  <span className="text-xs font-mono text-[var(--primary)] shrink-0 mt-1">{num}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your partners?</h2>
          <p className="text-gray-400 mb-8">Two minutes. No account required to get started.</p>
          <Link
            href="/survey"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300"
          >
            Take the Survey
          </Link>
        </div>
      </section>

      {/* Footer back link */}
      <div className="border-t border-white/[0.06] py-8 px-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors">← Back to Howdi</Link>
      </div>
    </div>
  );
}
