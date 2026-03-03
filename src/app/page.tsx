import Link from 'next/link';
import Image from 'next/image';
import { NavBar } from '@/components/NavBar';
import { HowItWorks } from '@/components/HowItWorks';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      {/* ============================================ */}
      {/* HERO - The opening statement                 */}
      {/* ============================================ */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[var(--primary)]/[0.03] rounded-full blur-[160px] pointer-events-none animate-hero-fade" />
        <div className="absolute top-[100px] right-[10%] w-[400px] h-[400px] bg-[var(--accent)]/[0.02] rounded-full blur-[120px] pointer-events-none animate-hero-fade delay-500" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="opacity-0 animate-hero-up delay-100">
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-medium tracking-[0.2em] uppercase border border-white/[0.08] bg-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              The podcast partner platform
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mt-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.03em] leading-[0.95] opacity-0 animate-hero-up delay-300">
            Your podcast
            <br />
            deserves partners.
          </h1>

          {/* Decorative line */}
          <div className="flex justify-center mt-8 mb-8 opacity-0 animate-hero-fade delay-600">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent animate-draw-line delay-800" />
          </div>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light opacity-0 animate-hero-up delay-700 text-balance">
            You&apos;ve built the audience. You&apos;ve put in the hours. Now let us connect
            you with brands that actually align with your show.
          </p>

          {/* CTA */}
          <div className="mt-12 opacity-0 animate-hero-up delay-1000">
            <Link
              href="/survey"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 text-base hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              Find Your Partners
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Free. Two minutes. No account required.
            </p>
          </div>
        </div>

        {/* Hero image - podcaster at mic, cinematic */}
        <div className="relative max-w-5xl mx-auto mt-24 opacity-0 animate-hero-fade delay-1200">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-[var(--primary)]/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10 pointer-events-none" />
            <Image
              src="/images/soundtrap-UKyJ3rWHNt8-unsplash.jpg"
              alt="Podcaster with headphones and microphone"
              width={1400}
              height={600}
              className="w-full h-[300px] md:h-[420px] object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE PROBLEM - Storytelling section            */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-8">
              The reality
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-8 text-balance">
              Finding partners shouldn&apos;t feel like shouting into the void.
            </h2>
          </ScrollReveal>

          {/* Atmospheric image */}
          <ScrollReveal delay={150}>
            <div className="relative rounded-2xl overflow-hidden mb-10 border border-white/[0.04]">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 to-transparent z-10 pointer-events-none" />
              <Image
                src="/images/jeremy-enns-1vrWiQvtxW8-unsplash.jpg"
                alt="Podcaster recording in a plant-filled studio"
                width={1200}
                height={400}
                className="w-full h-[200px] md:h-[280px] object-cover"
              />
            </div>
          </ScrollReveal>

          <div className="space-y-6 text-lg md:text-xl text-gray-400 leading-relaxed font-light">
            <ScrollReveal delay={200}>
              <p>
                You&apos;ve spent months -- maybe years -- building something real. Your listeners
                trust you. They show up every week. They tell their friends. Your podcast isn&apos;t
                a hobby anymore. It&apos;s a voice that matters.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p>
                But when it comes to monetization, you&apos;re stuck. You Google &ldquo;how to get
                podcast partners.&rdquo; You send cold emails to generic info@ addresses. You fill
                out forms on partnership marketplaces and hear nothing back. You start to
                wonder if your show just isn&apos;t big enough.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <p className="text-[var(--foreground)] font-normal">
                It&apos;s not a size problem. It&apos;s a connection problem.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <p>
                The brands who would love to partner with your show? They exist. They have budgets
                allocated for podcast advertising. They&apos;re looking for creators exactly like
                you. They just don&apos;t know you exist yet.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE SHIFT - Introducing the solution          */}
      {/* ============================================ */}
      <section className="relative px-6 py-32 overflow-hidden">
        {/* Centered glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/[0.04] rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--primary)] mb-8">
              A better way
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-8 text-balance">
              We match you directly with the people
              <br className="hidden md:block" />
              who write the checks.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light mb-16">
              Howdi isn&apos;t a marketplace where you wait to be discovered. It&apos;s a matching
              engine that connects your podcast with partner contacts -- real names, real emails,
              real decision-makers -- based on who your audience actually is.
            </p>
          </ScrollReveal>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-left">
            <ScrollReveal delay={300}>
              <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[var(--primary)]/20 group-hover:scale-105">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="9" stroke="var(--primary)" strokeWidth="1.5" />
                    <circle cx="11" cy="11" r="4" stroke="var(--primary)" strokeWidth="1.5" />
                    <circle cx="11" cy="11" r="1" fill="var(--primary)" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Precision matching</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We don&apos;t blast your profile to hundreds of brands. We analyze your category,
                  audience, tone, and format to find the partners that genuinely fit.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[var(--accent)]/20 group-hover:scale-105">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 3v7l5 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11" cy="11" r="9" stroke="var(--accent)" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Two-minute setup</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Seven questions about your show. That&apos;s it. No lengthy applications,
                  no media kits required, no waiting for approval from a human gatekeeper.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="group">
                <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[var(--success)]/20 group-hover:scale-105">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4 11l5 5L18 6" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Direct contact</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Names, emails, LinkedIn profiles, phone numbers. The actual people who
                  make partnership decisions -- not a generic submissions portal.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS - Existing component             */}
      {/* ============================================ */}
      <HowItWorks />

      {/* ============================================ */}
      {/* NUMBERS - Stats that build trust              */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-4">
                By the numbers
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
                Designed to respect your time.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScrollReveal delay={100}>
              <div className="text-center p-8 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50 hover:border-[var(--primary)]/20 transition-colors duration-500">
                <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">7</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center p-8 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50 hover:border-[var(--accent)]/20 transition-colors duration-500">
                <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">2<span className="text-2xl md:text-3xl text-gray-500">min</span></div>
                <div className="text-sm text-gray-500">Average time</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-center p-8 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50 hover:border-[var(--success)]/20 transition-colors duration-500">
                <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2 gradient-text-primary">Direct</div>
                <div className="text-sm text-gray-500">Contact info</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="text-center p-8 rounded-2xl bg-[var(--primary)]/[0.06] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/[0.1] transition-colors duration-500">
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] mb-2">$0</div>
                <div className="text-sm text-gray-500">Always free to start</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CINEMATIC VIDEO - The craft of podcasting     */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-4">
                See it in action
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] mb-4">
                From mic to money.
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                Watch how podcasters go from recording to reaching out to partners -- all in one seamless flow.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-[var(--primary)]/[0.08] group">
              {/* Video overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/60 via-transparent to-[var(--background)]/20 z-10 pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

              {/* Ambient video loop - podcast/audio visual */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[300px] md:h-[480px] object-cover"
                poster="/images/flipsnack-4GyrlS5-PGM-unsplash.jpg"
              >
                <source src="https://videos.pexels.com/video-files/6953963/6953963-uhd_2560_1440_30fps.mp4" type="video/mp4" />
              </video>

              {/* Subtle corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/10 rounded-tl-lg z-20" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/10 rounded-tr-lg z-20" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/10 rounded-bl-lg z-20" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/10 rounded-br-lg z-20" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE JOURNEY - Deep storytelling               */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
            {/* Left column - story */}
            <div>
              <ScrollReveal>
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-8">
                  For every podcaster
                </p>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] leading-[1.1] mb-8">
                  Whether you have 1,000 listeners
                  <span className="text-gray-500"> or 100,000.</span>
                </h2>
              </ScrollReveal>

              <div className="space-y-6 text-gray-400 leading-relaxed">
                <ScrollReveal delay={200}>
                  <p>
                    The podcast industry tells you that you need 10,000 downloads per episode
                    before anyone will talk to you. That&apos;s not true. Niche audiences are
                    incredibly valuable to the right brands.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <p>
                    A true crime podcast with 3,000 dedicated listeners is a goldmine for a
                    security company. A parenting show with 5,000 downloads is exactly what
                    a children&apos;s education brand is looking for. A tech podcast with 2,000
                    engaged developers? Enterprise SaaS companies would love that audience.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <p className="text-[var(--foreground)]">
                    The partners are out there. The gap isn&apos;t your audience size -- it&apos;s
                    that nobody has made the introduction yet.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={500}>
                  <p>
                    That&apos;s what Howdi does. We make the introduction.
                  </p>
                </ScrollReveal>
              </div>
            </div>

            {/* Right column - feature list */}
            <div className="space-y-8 md:pt-24">
              <ScrollReveal delay={200}>
                <div className="p-6 rounded-2xl border border-[var(--border)]/50 bg-[var(--card)]/30 hover:bg-[var(--card)]/60 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1v14M1 8h14" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Any audience size</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        10K+ downloads per episode? You&apos;ll get matched with partner contacts
                        immediately. Under 10K? You&apos;ll get a personalized growth plan to
                        help you get there.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="p-6 rounded-2xl border border-[var(--border)]/50 bg-[var(--card)]/30 hover:bg-[var(--card)]/60 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8l4.5 4.5L14 3.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Outreach templates included</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Not sure what to say? Every match comes with professionally written
                        email templates -- formal, casual, follow-up, and value-prop -- that
                        you can customize and send in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="p-6 rounded-2xl border border-[var(--border)]/50 bg-[var(--card)]/30 hover:bg-[var(--card)]/60 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="12" height="12" rx="3" stroke="var(--success)" strokeWidth="1.5" />
                        <path d="M5 8h6M8 5v6" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Save your own templates</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Found a pitch that works? Save it as a reusable template. Your
                        saved templates auto-fill with each partner&apos;s details, so
                        you&apos;re always personal, never generic.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <div className="p-6 rounded-2xl border border-[var(--border)]/50 bg-[var(--card)]/30 hover:bg-[var(--card)]/60 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L2 14h12L8 2z" stroke="var(--warning)" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M8 6v4M8 12h.01" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">No middlemen</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Most platforms sit between you and the partner, taking a cut.
                        We give you the contact directly. The relationship is yours.
                        The revenue is yours. The terms are yours.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE MOMENT - Emotional inflection point       */}
      {/* ============================================ */}
      <section className="relative px-6 py-40 overflow-hidden">
        {/* Background image - subtle, desaturated */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/or-hakim-Vc6yFhlWHT4-unsplash.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
            aria-hidden="true"
          />
        </div>
        {/* Full-width ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)] pointer-events-none z-[1]" />

        <div className="relative max-w-3xl mx-auto text-center z-[2]">
          <ScrollReveal>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-light leading-[1.3] tracking-[-0.01em] text-balance">
              <span className="text-gray-500">&ldquo;</span>
              The difference between a podcast that makes money and one that doesn&apos;t
              isn&apos;t talent, or downloads, or even content quality.
              <span className="text-[var(--foreground)] font-normal"> It&apos;s whether someone made the right introduction.</span>
              <span className="text-gray-500">&rdquo;</span>
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-[var(--primary)]/40" />
              <span className="text-sm text-gray-500 tracking-wide">
                The Howdi Philosophy
              </span>
              <div className="h-px w-8 bg-[var(--primary)]/40" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE DETAILS - What you actually get           */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-8">
              What you get
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] leading-[1.1] mb-16">
              Everything you need to land
              <br />
              <span className="text-gray-500">your first (or next) partner.</span>
            </h2>
          </ScrollReveal>

          <div className="space-y-16">
            <ScrollReveal delay={200}>
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-xs font-mono text-[var(--primary)]">01</span>
                  <h3 className="text-xl font-semibold">Partner matches tailored to your show</h3>
                </div>
                <p className="text-gray-400 leading-relaxed ml-10">
                  Based on your category, audience demographics, content tone, and release schedule,
                  we surface the brands most likely to say yes. Not a random list. A curated set
                  of contacts with match scores and reasons why they&apos;re a fit.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-xs font-mono text-[var(--primary)]">02</span>
                  <h3 className="text-xl font-semibold">Real decision-maker contact details</h3>
                </div>
                <p className="text-gray-400 leading-relaxed ml-10">
                  Every match includes the name and title of the person at the brand who
                  handles podcast partnerships, their direct email, LinkedIn profile, and
                  when available, their phone number. No generic contact forms.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-xs font-mono text-[var(--primary)]">03</span>
                  <h3 className="text-xl font-semibold">Ready-to-send email templates</h3>
                </div>
                <p className="text-gray-400 leading-relaxed ml-10">
                  Four professionally crafted outreach templates that auto-fill with your
                  podcast details and the partner&apos;s information. Professional, casual,
                  follow-up, and data-driven variants. Edit them, save your own, and send
                  directly from the platform.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-xs font-mono text-[var(--primary)]">04</span>
                  <h3 className="text-xl font-semibold">A growth plan if you&apos;re not there yet</h3>
                </div>
                <p className="text-gray-400 leading-relaxed ml-10">
                  Under 10,000 downloads per episode? No problem. Instead of matches, you&apos;ll
                  receive a personalized consultation with actionable steps to grow your audience
                  to a partner-ready size. We want you to succeed, not just sign up.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* IMAGE BREAK - Visual breathing room          */}
      {/* ============================================ */}
      <section className="px-6 py-16">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.04] h-[200px] md:h-[280px]">
              <Image
                src="/images/videodeck-co-FD8ac8iw0sc-unsplash.jpg"
                alt="Podcast host smiling with headphones and microphone"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 to-transparent" />
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.04] h-[200px] md:h-[280px]">
              <Image
                src="/images/tim-mossholder-eoNL6y4C2JQ-unsplash.jpg"
                alt="Smiling podcaster with headphones and microphone"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 to-transparent" />
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.04] h-[200px] md:h-[280px]">
              <Image
                src="/images/dan-lefebvre-Cbzv4DNS8Ew-unsplash.jpg"
                alt="Woman with headphones enjoying a podcast"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 to-transparent" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA - The close                        */}
      {/* ============================================ */}
      <section className="relative px-6 py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/[0.02] via-[var(--primary)]/[0.04] to-transparent pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-6">
              Your next partner is
              <br />
              <span className="gradient-text-primary">waiting to hear from you.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-lg text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed font-light">
              Seven questions. Two minutes. Matches you can act on today. The brands
              are already spending money on podcast ads -- make sure some of it goes to you.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Link
              href="/survey"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 text-base hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              Start the Survey
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <p className="mt-6 text-sm text-gray-600">
              No credit card. No commitment. Just clarity on who your partners should be.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/images/howdi-logo-grey.png" alt="Howdi" className="w-7 h-7 object-contain" />
                <span className="font-bold text-base text-gray-300">Howdi</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connecting podcasters with the right partners. Built for creators who are serious about growing their show.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/survey" className="text-sm text-gray-400 hover:text-white transition-colors">Find Partners</Link></li>
                <li><Link href="/sponsors" className="text-sm text-gray-400 hover:text-white transition-colors">My Matches</Link></li>
                <li><Link href="/subscribe" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/survey" className="text-sm text-gray-400 hover:text-white transition-colors">Take the Survey</Link></li>
              </ul>
            </div>

            {/* For Podcasters */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">For Podcasters</h4>
              <ul className="space-y-3">
                <li><Link href="/survey" className="text-sm text-gray-400 hover:text-white transition-colors">Get Matched</Link></li>
                <li><Link href="/subscribe" className="text-sm text-gray-400 hover:text-white transition-colors">Upgrade to Pro</Link></li>
                <li><Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">Your Profile</Link></li>
                <li><Link href="/profile?tab=outreach" className="text-sm text-gray-400 hover:text-white transition-colors">Outreach History</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Howdi. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Helping podcasters find the right partners — one introduction at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
