'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { SponsorResults } from '@/components/SponsorResults';
import { DashboardShell } from '@/components/DashboardShell';
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
  const [scoringMethod, setScoringMethod] = useState<string>('keyword');
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tokensRemaining, setTokensRemaining] = useState(0);
  const [tokenRefreshKey, setTokenRefreshKey] = useState(0);

  const fetchMatches = useCallback(
    async (answers: QuizAnswers, podcast: PodcastInfo | null) => {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers: answers, podcastInfo: podcast }),
      });
      return res.json() as Promise<Record<string, any>>;
    },
    [],
  );

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens');
      if (res.ok) {
        const data = await res.json() as { tokensRemaining: number };
        setTokensRemaining(data.tokensRemaining ?? 0);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleContactUnlocked = useCallback(() => {
    setTokensRemaining(prev => Math.max(0, prev - 1));
    setTokenRefreshKey(prev => prev + 1);
  }, []);

  // Fetch token status on auth
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTokens();
    }
  }, [status, fetchTokens]);

  // Fetch user's profile data and build quiz/podcast info from it
  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    fetch('/api/user/profile')
      .then((res) => res.json() as Promise<Record<string, any>>)
      .then(async (data) => {
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

        const podcast: PodcastInfo = {
          email: s.email || data.user?.email || '',
          podcastName: s.podcast_name || '',
          podcastUrl: s.podcast_url || '',
          description: s.description || '',
          hasMediaKit: !!s.has_media_kit,
        };
        setPodcastInfo(podcast);

        // Fetch matches using user's actual quiz answers
        const matchData = await fetchMatches(answers, podcast);
        if (matchData && !matchData.error) {
          setMatches(matchData.matches);
          setTotalMatches(matchData.total);
          setIsLimited(matchData.limited);
          setScoringMethod(matchData.scoringMethod || 'keyword');

          // If AI scoring is pending, schedule a retry
          if (matchData.scoringMethod === 'ai-pending') {
            setAiEnhancing(true);
            retryTimerRef.current = setTimeout(async () => {
              try {
                const retryData = await fetchMatches(answers, podcast);
                if (retryData && !retryData.error) {
                  setMatches(retryData.matches);
                  setTotalMatches(retryData.total);
                  setIsLimited(retryData.limited);
                  setScoringMethod(retryData.scoringMethod || 'keyword');
                }
              } catch {
                // AI retry failed, keyword results remain
              } finally {
                setAiEnhancing(false);
              }
            }, 5000);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [status, fetchMatches]);

  return (
    <DashboardShell activeTab="sponsors">
      <main className="pt-6">
        {aiEnhancing && (
          <div className="max-w-4xl mx-auto px-6 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enhancing matches with AI...
            </div>
          </div>
        )}

        {loading || status === 'loading' ? (
          <div className="pt-24 text-center text-gray-400">Loading your matches...</div>
        ) : !session ? (
          <div className="pt-24 text-center text-gray-400">
            Please sign in to see your partner matches.
          </div>
        ) : !quizAnswers ? (
          <div className="pt-24 text-center">
            <p className="text-gray-400 mb-4">
              Complete the survey first so we can match you with the right partners.
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
              tokensRemaining={tokensRemaining}
              onContactUnlocked={handleContactUnlocked}
              tokenRefreshKey={tokenRefreshKey}
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
                      Unlock all {totalMatches} partner opportunities
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Subscribe to get full access to every matched partner, plus priority contact details and outreach templates.
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
    </DashboardShell>
  );
}
