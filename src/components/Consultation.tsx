'use client';

import { QuizAnswers } from '@/types';

interface ConsultationProps {
  quizAnswers: QuizAnswers;
}

export function Consultation({ quizAnswers }: ConsultationProps) {
  const calendlyUrl = 'https://calendly.com/ryan-wildcast/podcast-growth'; // Update with your actual Calendly link

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Icon */}
        <div className="inline-block p-5 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full mb-6">
          <svg className="w-12 h-12 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Let&apos;s Get You to 10,000+ Downloads
        </h1>

        <p className="text-xl text-gray-400 mb-8">
          You&apos;re closer than you think. In a free 15-minute call, I&apos;ll show you
          exactly how to grow your podcast to 10K+ downloads in just a few months.
        </p>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">100+</div>
            <div className="text-sm text-gray-400">Podcasts helped reach 10K</div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="text-3xl font-bold text-[var(--accent)] mb-2">3-6</div>
            <div className="text-sm text-gray-400">Months to hit your goal</div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="text-3xl font-bold text-[var(--success)] mb-2">Free</div>
            <div className="text-sm text-gray-400">No strings attached</div>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 mb-10 text-left">
          <h2 className="text-xl font-semibold mb-6 text-center">What We&apos;ll Cover</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Your Personalized Growth Strategy</div>
                <div className="text-sm text-gray-400">Based on your {quizAnswers.category?.replace('-', ' ')} podcast and {quizAnswers.format} format</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Quick Wins You Can Implement Today</div>
                <div className="text-sm text-gray-400">Actionable tactics to start growing immediately</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Roadmap to 10K+ Downloads</div>
                <div className="text-sm text-gray-400">A clear path to unlock sponsorship opportunities</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:opacity-90 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg shadow-[var(--primary)]/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule Your Free Call
        </a>

        <p className="text-sm text-gray-500 mt-4">
          15 minutes. No pitch. Just actionable advice.
        </p>

        {/* Social Proof */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-gray-500 mb-4">Trusted by podcasters from</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <span className="text-lg font-semibold">Spotify</span>
            <span className="text-lg font-semibold">Apple Podcasts</span>
            <span className="text-lg font-semibold">YouTube</span>
          </div>
        </div>
      </div>
    </div>
  );
}
