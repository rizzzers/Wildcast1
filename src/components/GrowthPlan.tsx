'use client';

import { QuizAnswers, GrowthPlan as GrowthPlanType } from '@/types';

interface GrowthPlanProps {
  quizAnswers: QuizAnswers;
  growthPlan: GrowthPlanType;
}

export function GrowthPlan({ quizAnswers, growthPlan }: GrowthPlanProps) {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block p-4 bg-[var(--accent)]/20 rounded-full mb-4">
            <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Growth Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here&apos;s a personalized roadmap to grow your audience to 10K+ downloads
            and unlock sponsor partnerships.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
          <h2 className="text-xl font-semibold mb-4">Your Podcast Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Category</div>
              <div className="font-semibold capitalize">{quizAnswers.category?.replace('-', ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Tone</div>
              <div className="font-semibold capitalize">{quizAnswers.tone?.replace('-', ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Format</div>
              <div className="font-semibold capitalize">{quizAnswers.format}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Frequency</div>
              <div className="font-semibold capitalize">{quizAnswers.releaseFrequency}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Target Audience</div>
              <div className="font-semibold capitalize">{quizAnswers.listenerType?.replace('-', ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Current Status</div>
              <div className="font-semibold">Growing (Under 10K)</div>
            </div>
          </div>
        </div>

        {/* Growth Strategies */}
        <div className="space-y-6">
          {/* Cross Promotion */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--primary)]/20 rounded-xl">
                <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Cross-Promotion Partners</h3>
                <p className="text-gray-400 mb-4">
                  Shows in your niche that would make great cross-promo partners. Reach out and propose swapping 30-60 second promos.
                </p>
                <div className="space-y-3">
                  {growthPlan.crossPromoShows.map((show, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                    >
                      <span>{show}</span>
                      <button className="text-[var(--accent)] text-sm hover:underline">
                        Find Contact
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guesting Opportunities */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 animate-slide-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--success)]/20 rounded-xl">
                <svg className="w-6 h-6 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Guesting Opportunities</h3>
                <p className="text-gray-400 mb-4">
                  Larger shows where you could appear as a guest. Being a guest on bigger shows is one of the fastest ways to grow.
                </p>
                <div className="space-y-3">
                  {growthPlan.guestingOpportunities.map((show, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                    >
                      <span>{show}</span>
                      <button className="text-[var(--accent)] text-sm hover:underline">
                        Pitch Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Strategies */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 animate-slide-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--warning)]/20 rounded-xl">
                <svg className="w-6 h-6 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Distribution Strategies</h3>
                <p className="text-gray-400 mb-4">
                  Tactics to amplify your reach based on your content type and audience.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {growthPlan.distributionStrategies.map((strategy, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg"
                    >
                      <span className="text-[var(--primary)] font-bold">{index + 1}</span>
                      <span className="text-sm">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-[1px] rounded-2xl">
            <div className="bg-[var(--background)] rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-2">Ready for Sponsors?</h3>
              <p className="text-gray-400 mb-4">
                Once you hit 10K downloads/episode, come back and we&apos;ll match you with sponsors ready to pay.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-semibold transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
