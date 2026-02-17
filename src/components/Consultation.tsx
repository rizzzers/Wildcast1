'use client';

import Image from 'next/image';
import { QuizAnswers } from '@/types';

interface ConsultationProps {
  quizAnswers: QuizAnswers;
}

export function Consultation({ quizAnswers }: ConsultationProps) {
  const calendlyUrl = 'https://calendly.com/ryanestes/discovery-meeting-clone';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* ============================================ */}
      {/* HERO - The opening statement                  */}
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
              Free growth consultation
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mt-10 text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] leading-[0.95] opacity-0 animate-hero-up delay-300">
            Let&apos;s get you to
            <br />
            <span className="gradient-text-primary">10,000+ downloads.</span>
          </h1>

          {/* Decorative line */}
          <div className="flex justify-center mt-8 mb-8 opacity-0 animate-hero-fade delay-600">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent animate-draw-line delay-800" />
          </div>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light opacity-0 animate-hero-up delay-700 text-balance">
            You&apos;re not starting from zero. You&apos;ve already got a podcast, an audience,
            and momentum. In just 15 minutes, I&apos;ll map out exactly how to get you to 10K+
            downloads in a few months.
          </p>

          {/* CTA */}
          <div className="mt-12 opacity-0 animate-hero-up delay-1000">
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 text-base hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              Grab Your Free Call
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="mt-4 text-sm text-gray-600">
              15 minutes. Real advice. Zero strings.
            </p>
          </div>
        </div>

        {/* Hero image - podcaster at mic, cinematic */}
        <div className="relative max-w-5xl mx-auto mt-24 opacity-0 animate-hero-fade delay-1200">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-[var(--primary)]/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10 pointer-events-none" />
            <Image
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1400&h=600&fit=crop&crop=center"
              alt="Podcaster recording in a professional studio"
              width={1400}
              height={600}
              className="w-full h-[300px] md:h-[420px] object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* NUMBERS - Stats that build trust              */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-hero-up" style={{ animationDelay: '1400ms' }}>
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-4">
              It&apos;s more doable than you think
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
              Straight talk. Real strategy. Just a game plan.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-8 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50 hover:border-[var(--primary)]/20 transition-colors duration-500 opacity-0 animate-hero-up" style={{ animationDelay: '1500ms' }}>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] mb-2">100+</div>
              <div className="text-sm text-gray-500">Podcasters helped hit 10K</div>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]/50 hover:border-[var(--accent)]/20 transition-colors duration-500 opacity-0 animate-hero-up" style={{ animationDelay: '1600ms' }}>
              <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">3–6<span className="text-2xl md:text-3xl text-gray-500"> mo</span></div>
              <div className="text-sm text-gray-500">Yep, that fast</div>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[var(--primary)]/[0.06] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/[0.1] transition-colors duration-500 opacity-0 animate-hero-up" style={{ animationDelay: '1700ms' }}>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] mb-2">$0</div>
              <div className="text-sm text-gray-500">Because why not?</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE MOMENT - Emotional inflection             */}
      {/* ============================================ */}
      <section className="relative px-6 py-40 overflow-hidden">
        {/* Background image - subtle, desaturated */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1800&h=800&fit=crop&crop=center"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
            aria-hidden="true"
          />
        </div>
        {/* Full-width ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)] pointer-events-none z-[1]" />

        <div className="relative max-w-3xl mx-auto text-center z-[2]">
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-light leading-[1.3] tracking-[-0.01em] text-balance reveal visible">
            <span className="text-gray-500">&ldquo;</span>
            The difference between a podcast that makes money and one that doesn&apos;t
            isn&apos;t talent, or downloads, or even content quality.
            <span className="text-[var(--foreground)] font-normal"> It&apos;s whether someone showed you the path to get there.</span>
            <span className="text-gray-500">&rdquo;</span>
          </blockquote>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-[var(--primary)]/40" />
            <span className="text-sm text-gray-500 tracking-wide">
              The Wildcast Philosophy
            </span>
            <div className="h-px w-8 bg-[var(--primary)]/40" />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHAT WE'LL DIG INTO - The details             */}
      {/* ============================================ */}
      <section className="px-6 py-32 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-600 mb-8 reveal visible">
            What we&apos;ll dig into
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] leading-[1.1] mb-16 reveal visible">
            A roadmap built for
            <br />
            <span className="text-gray-500">your show specifically.</span>
          </h2>

          <div className="space-y-16">
            <div className="group reveal visible">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-xs font-mono text-[var(--primary)]">01</span>
                <h3 className="text-xl font-semibold">A Growth Plan Built Around Your Show</h3>
              </div>
              <p className="text-gray-400 leading-relaxed ml-10">
                Not cookie-cutter advice. We&apos;ll look at your{' '}
                {quizAnswers.format || 'format'}, your{' '}
                {quizAnswers.category?.replace('-', ' ') || 'niche'}, and where your biggest
                opportunities are hiding.
              </p>
            </div>

            <div className="group reveal visible">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-xs font-mono text-[var(--primary)]">02</span>
                <h3 className="text-xl font-semibold">Quick Wins You Can Run With Today</h3>
              </div>
              <p className="text-gray-400 leading-relaxed ml-10">
                Walk away with tactics you can implement before your next episode drops.
                Real strategies, not vague advice about &ldquo;being consistent.&rdquo;
              </p>
            </div>

            <div className="group reveal visible">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-xs font-mono text-[var(--primary)]">03</span>
                <h3 className="text-xl font-semibold">Your Roadmap to 10K+ (and Sponsorship-Ready)</h3>
              </div>
              <p className="text-gray-400 leading-relaxed ml-10">
                A clear, step-by-step path from where you are now to where the sponsorship
                conversations start. We want you to succeed, not just sign up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA - The close                         */}
      {/* ============================================ */}
      <section className="relative px-6 py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/[0.02] via-[var(--primary)]/[0.04] to-transparent pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-6 reveal visible">
            Your path to 10K starts
            <br />
            <span className="gradient-text-primary">with a 15-minute call.</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed font-light reveal visible">
            Honest advice, zero pitch. Just a game plan that actually works. The podcasters
            who hit 10K all started with a single conversation.
          </p>

          <div className="reveal visible">
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[var(--background)] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 text-base hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              Grab Your Free Call
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-600 reveal visible">
            15 minutes. Real advice. Zero strings.
          </p>
        </div>
      </section>
    </div>
  );
}
