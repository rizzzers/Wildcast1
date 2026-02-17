'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@/components/Quiz';
import { EmailGate } from '@/components/EmailGate';
import { SponsorResults } from '@/components/SponsorResults';
import { GrowthPlan } from '@/components/GrowthPlan';
import { Consultation } from '@/components/Consultation';
import { QuizAnswers, PodcastInfo, GrowthPlan as GrowthPlanType, AppStep } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';

export default function SurveyPage() {
  const [step, setStep] = useState<AppStep>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [podcastInfo, setPodcastInfo] = useState<PodcastInfo | null>(null);
  const [contactMatches, setContactMatches] = useState<ContactMatch[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlanType | null>(null);

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setStep('email-gate');
  };

  const handleEmailSubmit = async (info: PodcastInfo) => {
    setPodcastInfo(info);

    // Persist survey submission
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizAnswers,
          email: info.email,
          podcastName: info.podcastName,
          podcastUrl: info.podcastUrl,
          description: info.description,
          hasMediaKit: info.hasMediaKit,
        }),
      });
      const data = await res.json();
      if (data.id) {
        sessionStorage.setItem('wildcast_submission_id', data.id);
      }
    } catch (error) {
      console.error('Failed to persist survey:', error);
    }

    if (quizAnswers.audienceSize === 'over-10k') {
      // Fetch matched contacts from the server
      try {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizAnswers),
        });
        const data = await res.json();
        setContactMatches(data.matches || data);
      } catch (error) {
        console.error('Failed to fetch contact matches:', error);
      }
      setStep('results');
    } else {
      setStep('consultation');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg" />
            <span className="font-bold text-xl">Sponsor Vibe</span>
          </Link>
          {step !== 'quiz' && (
            <button
              onClick={() => {
                setStep('quiz');
                setQuizAnswers({});
                setPodcastInfo(null);
                setContactMatches([]);
                setGrowthPlan(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="pt-20">
        {step === 'quiz' && (
          <Quiz onComplete={handleQuizComplete} />
        )}

        {step === 'email-gate' && (
          <EmailGate onSubmit={handleEmailSubmit} />
        )}

        {step === 'results' && podcastInfo && (
          <SponsorResults
            matches={contactMatches}
            quizAnswers={quizAnswers}
            podcastInfo={podcastInfo}
            isLimited={false}
            outreachHistory={[]}
          />
        )}

        {step === 'growth-plan' && growthPlan && (
          <GrowthPlan
            quizAnswers={quizAnswers}
            growthPlan={growthPlan}
          />
        )}

        {step === 'consultation' && (
          <Consultation quizAnswers={quizAnswers} />
        )}
      </main>
    </div>
  );
}
