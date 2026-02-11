import Link from 'next/link';
import { NavBar } from '@/components/NavBar';
import { HowItWorks } from '@/components/HowItWorks';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[var(--primary)]/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="inline-block text-xs font-medium tracking-widest uppercase text-[var(--accent)] mb-6">
            Podcast Growth Platform
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Find the right sponsors
            <br />
            <span className="text-gray-500">for your podcast.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Answer a few questions about your show. We&apos;ll match you with
            sponsors that align with your audience, content, and goals.
          </p>
          <Link
            href="/survey"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-200 transition-colors text-base"
          >
            Start the Survey
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Value props */}
      <section className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
                Built for podcasters
                <br />
                <span className="text-gray-500">who are ready to grow.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1.5v15M1.5 9h15" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Any audience size</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      10K+ downloads get sponsor matches. Under 10K get a personalized
                      growth consultation to get you there.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2.25 9l5.25 5.25L15.75 3.75" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real contacts</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Direct emails, LinkedIn profiles, and phone numbers for
                      the people who actually make sponsorship decisions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="var(--primary)" strokeWidth="1.5" />
                      <path d="M9 5.25V9l2.625 1.5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Two minutes</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The survey takes about two minutes. No account required,
                      no credit card, no catch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats / visual block */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="text-3xl font-bold mb-1">7</div>
                <div className="text-sm text-gray-400">Quick questions</div>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="text-3xl font-bold mb-1">2m</div>
                <div className="text-sm text-gray-400">Average time</div>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="text-3xl font-bold mb-1">Direct</div>
                <div className="text-sm text-gray-400">Contact info</div>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                <div className="text-3xl font-bold text-[var(--primary)] mb-1">Free</div>
                <div className="text-sm text-gray-400">Always</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Ready to find your sponsors?
          </h2>
          <p className="text-gray-400 mb-8">
            It starts with understanding your podcast. Let&apos;s go.
          </p>
          <Link
            href="/survey"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-200 transition-colors text-base"
          >
            Take the Survey
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded" />
            <span className="text-sm text-gray-500">Wildcast</span>
          </div>
          <p className="text-sm text-gray-500">
            Questions? <a href="mailto:ryan@ryanestes.info" className="text-gray-400 hover:text-white transition-colors">ryan@ryanestes.info</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
