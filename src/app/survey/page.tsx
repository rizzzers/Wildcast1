'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Quiz } from '@/components/Quiz';
import { SponsorResults } from '@/components/SponsorResults';
import { GrowthPlan } from '@/components/GrowthPlan';
import { Consultation } from '@/components/Consultation';
import { AuthModal } from '@/components/AuthModal';
import { QuizAnswers, PodcastInfo, EmailContext, GrowthPlan as GrowthPlanType, AppStep } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';

export default function SurveyPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<AppStep>('quiz');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [podcastInfo, setPodcastInfo] = useState<PodcastInfo | null>(null);
  const [contactMatches, setContactMatches] = useState<ContactMatch[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlanType | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setQuizAnswers(answers);

    // Route under-10k to consultation
    if (answers.audienceSize === 'under-10k') {
      setStep('consultation');
      return;
    }

    // Fetch contacts immediately with just quiz answers
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers: answers }),
      });
      const data = await res.json() as Record<string, any>;
      setContactMatches(data.matches || data);
    } catch (error) {
      console.error('Failed to fetch contact matches:', error);
    }

    setStep('results');
  };

  const handleUnlock = async (info: PodcastInfo, accountInfo?: { name: string; password: string }) => {
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
      const data = await res.json() as Record<string, any>;
      if (data.id) {
        sessionStorage.setItem('wildcast_submission_id', data.id);
        localStorage.setItem('wildcast_submission_id', data.id);
      }
    } catch (error) {
      console.error('Failed to persist survey:', error);
    }

    // Send email notification
    try {
      await fetch('/api/submit-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Optionally create account
    if (accountInfo) {
      try {
        const submissionId = sessionStorage.getItem('wildcast_submission_id');
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: info.email,
            password: accountInfo.password,
            name: accountInfo.name,
            submissionId,
          }),
        });

        if (res.ok) {
          await signIn('credentials', {
            email: info.email,
            password: accountInfo.password,
            redirect: false,
          });
        }
      } catch (error) {
        console.error('Failed to create account:', error);
      }
    }

    setIsUnlocked(true);
  };

  const handleProfileContextUpdate = async (context: EmailContext) => {
    // Persist email context if authenticated
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContext: context }),
      });
    } catch (error) {
      console.error('Failed to save profile context:', error);
    }

    // Re-fetch contacts with email context
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAnswers,
          podcastInfo,
          emailContext: context,
        }),
      });
      const data = await res.json() as Record<string, any>;
      setContactMatches(data.matches || data);
    } catch (error) {
      console.error('Failed to re-fetch contact matches:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/howdi-logo-grey.png" alt="Howdi" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl">Howdi</span>
          </Link>
          <nav className="flex items-center gap-4">
            {step !== 'quiz' && (
              <button
                onClick={() => {
                  setStep('quiz');
                  setQuizAnswers({});
                  setPodcastInfo(null);
                  setContactMatches([]);
                  setGrowthPlan(null);
                  setIsUnlocked(false);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
            )}
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                {session.user.plan !== 'pro' && (
                  <Link
                    href="/subscribe"
                    className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
              >
                Create Account
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <main className="pt-20">
        {step === 'quiz' && (
          <Quiz onComplete={handleQuizComplete} />
        )}

        {step === 'results' && (
          <SponsorResults
            matches={contactMatches}
            quizAnswers={quizAnswers}
            podcastInfo={podcastInfo}
            isLimited={false}
            outreachHistory={[]}
            isLocked={!isUnlocked}
            onUnlock={handleUnlock}
            onProfileContextSubmit={handleProfileContextUpdate}
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
