'use client';

import { SponsorResults } from '@/components/SponsorResults';
import { sponsors } from '@/data/sponsors';
import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';

// Demo data
const demoQuizAnswers: QuizAnswers = {
  category: 'business',
  audienceSize: 'over-10k',
  listenerType: 'founders-executives',
  tone: 'tactical-serious',
  releaseFrequency: 'weekly',
  format: 'interview',
  primaryGoal: 'sponsorships',
};

const demoPodcastInfo: PodcastInfo = {
  email: 'host@mypodcast.com',
  podcastName: 'The Growth Mindset Show',
  podcastUrl: 'https://growthmindsetshow.com',
  description: 'Weekly conversations with entrepreneurs and thought leaders about building successful businesses.',
  hasMediaKit: true,
};

// Convert sponsors to matches with scores
const demoMatches: SponsorMatch[] = sponsors.map((sponsor, index) => ({
  ...sponsor,
  matchScore: Math.max(95 - index * 5, 60),
  matchReasons: [
    'Category match',
    'Audience alignment',
    'Tone preference',
  ],
}));

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg" />
            <span className="font-bold text-xl">Wildcast</span>
          </div>
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Start Over
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20">
        <SponsorResults
          matches={demoMatches}
          quizAnswers={demoQuizAnswers}
          podcastInfo={demoPodcastInfo}
        />
      </main>
    </div>
  );
}
