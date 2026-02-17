'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SponsorResults } from '@/components/SponsorResults';
import { NavBar } from '@/components/NavBar';
import { QuizAnswers, PodcastInfo } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';

export default function SponsorsPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [podcastInfo, setPodcastInfo] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [outreachHistory, setOutreachHistory] = useState<{ sponsor_id: string; sent_at: string }[]>([]);

  // Fetch user's profile data and build quiz/podcast info from it
  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.submission) {
          setLoading(false);
          return;
        }

        if (data.outreach) {
          setOutreachHistory(data.outreach);
        }

        const s = data.submission;
        const answers: QuizAnswers = {
          category: s.category || undefined,
          audienceSize: s.audience_size || undefined,
          listenerType: s.listener_type?.includes(',') ? s.listener_type.split(',') : (s.listener_type || undefined),
          tone: s.tone || undefined,
          releaseFrequency: s.release_frequency || undefined,
          format: s.format || undefined,
          primaryGoal: s.primary_goal || undefined,
        };
        setQuizAnswers(answers);

        setPodcastInfo({
          email: s.email || data.user?.email || '',
          podcastName: s.podcast_name || '',
          podcastUrl: s.podcast_url || '',
          description: s.description || '',
          hasMediaKit: !!s.has_media_kit,
        });

        // Fetch matches using user's actual quiz answers
        return fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data && !data.error) {
          setMatches(data.matches);
          setTotalMatches(data.total);
          setIsLimited(data.limited);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      <main className="pt-20">
        {loading || status === 'loading' ? (
          <div className="pt-24 text-center text-gray-400">Loading your matches...</div>
        ) : !session ? (
          <div className="pt-24 text-center text-gray-400">
            Please sign in to see your sponsor matches.
          </div>
        ) : !quizAnswers ? (
          <div className="pt-24 text-center">
            <p className="text-gray-400 mb-4">
              Complete the survey first so we can match you with the right sponsors.
            </p>
            <a
              href="/survey"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-medium transition-colors"
            >
              Take the Survey
            </a>
          </div>
        ) : (
          <>
            <SponsorResults
              matches={matches}
              quizAnswers={quizAnswers}
              podcastInfo={podcastInfo!}
              isLimited={isLimited}
              outreachHistory={outreachHistory}
            />

            {isLimited && totalMatches > matches.length && (
              <div className="max-w-4xl mx-auto px-6 pb-16">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/[0.08] to-[var(--accent)]/[0.04] p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent pointer-events-none" />
                  <div className="relative">
                    <p className="text-sm font-medium text-[var(--primary)] mb-2">
                      You&apos;re seeing {matches.length} of {totalMatches} matches
                    </p>
                    <h3 className="text-xl font-bold mb-2">
                      Unlock all {totalMatches} sponsor opportunities
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Subscribe to get full access to every matched sponsor, plus priority contact details and outreach templates.
                    </p>
                    <a
                      href="/subscribe"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-medium transition-colors"
                    >
                      Upgrade to Pro
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
