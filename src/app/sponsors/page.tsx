'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { SponsorResults } from '@/components/SponsorResults';
import { DashboardShell } from '@/components/DashboardShell';
import { QuizAnswers, PodcastInfo } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';

const CPM_RATES: Record<string, { cpmLow: number; cpmHigh: number; epLow: number; epHigh: number }> = {
  'tech':          { cpmLow: 25, cpmHigh: 50,  epLow: 2500, epHigh: 8000 },
  'business':      { cpmLow: 22, cpmHigh: 45,  epLow: 2000, epHigh: 7000 },
  'wellness':      { cpmLow: 18, cpmHigh: 40,  epLow: 1800, epHigh: 6500 },
  'pop-culture':   { cpmLow: 14, cpmHigh: 28,  epLow: 1200, epHigh: 5000 },
  'education':     { cpmLow: 20, cpmHigh: 40,  epLow: 1800, epHigh: 6000 },
  'entertainment': { cpmLow: 14, cpmHigh: 32,  epLow: 1200, epHigh: 5500 },
  'multi-topic':   { cpmLow: 13, cpmHigh: 28,  epLow: 1000, epHigh: 4500 },
};

const CATEGORY_LABELS: Record<string, string> = {
  'tech':          'Tech & Startups',
  'business':      'Business',
  'wellness':      'Health & Wellness',
  'pop-culture':   'Pop Culture',
  'education':     'Education',
  'entertainment': 'Entertainment',
  'multi-topic':   'Multi-Topic',
};

export default function SponsorsPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [hasSurvey, setHasSurvey] = useState(false);
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
  const [showRateBanner, setShowRateBanner] = useState(true);

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
        if (data.error) {
          setLoading(false);
          return;
        }

        if (data.outreach) {
          setOutreachHistory(data.outreach);
        }

        let answers: QuizAnswers = {};
        let podcast: PodcastInfo = {
          email: data.user?.email || '',
          podcastName: '',
          podcastUrl: '',
          description: '',
          hasMediaKit: false,
        };

        if (data.submission) {
          setHasSurvey(true);
          const s = data.submission;
          answers = {
            category: s.category || undefined,
            audienceSize: s.audience_size || undefined,
            listenerType: s.listener_type?.includes(',') ? s.listener_type.split(',') : (s.listener_type || undefined),
            tone: s.tone || undefined,
            releaseFrequency: s.release_frequency || undefined,
            format: s.format || undefined,
            primaryGoal: s.primary_goal || undefined,
          };
          podcast = {
            email: s.email || data.user?.email || '',
            podcastName: s.podcast_name || '',
            podcastUrl: s.podcast_url || '',
            description: s.description || '',
            hasMediaKit: !!s.has_media_kit,
          };
        }

        setQuizAnswers(answers);
        setPodcastInfo(podcast);

        // Fetch matches (uses survey data if available, otherwise shows all contacts)
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
        ) : quizAnswers.audienceSize === 'under-10k' ? (
          /* Under-10k callout — full-width, no matches shown */
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase border border-[var(--primary)]/30 bg-[var(--primary)]/[0.06] text-[var(--primary)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Free · 15 minutes · Zero strings
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
              Sponsors don&apos;t need convincing
              <br />
              <span className="text-gray-400 font-light">when your podcast is positioned right.</span>
            </h2>

            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
              In one free call, we&apos;ll map out exactly how to grow past 10K downloads and
              build a show sponsors are already waiting in line for — before you ever send a cold email.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-10 mb-12 text-center">
              <div>
                <div className="text-3xl font-bold text-[var(--primary)]">100+</div>
                <div className="text-xs text-gray-500 mt-1">Podcasters helped</div>
              </div>
              <div className="h-8 w-px bg-[var(--border)]" />
              <div>
                <div className="text-3xl font-bold">3–6<span className="text-xl text-gray-500"> mo</span></div>
                <div className="text-xs text-gray-500 mt-1">To hit 10K+</div>
              </div>
              <div className="h-8 w-px bg-[var(--border)]" />
              <div>
                <div className="text-3xl font-bold text-[var(--primary)]">$0</div>
                <div className="text-xs text-gray-500 mt-1">Completely free</div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="https://calendly.com/ryanestes/howdi-discovery"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 text-base shadow-[0_0_0_0_rgba(139,92,246,0)] hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]"
            >
              Book Your Free Discovery Call
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <p className="mt-5 text-sm text-gray-600">
              We map out your growth path — sponsors come later, naturally.
            </p>
          </div>
        ) : (
          <>
            {!hasSurvey && (
              <div className="max-w-4xl mx-auto px-6 mb-4">
                <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-gray-400">
                  <span>Showing all partners — <a href="/survey" className="text-[var(--primary)] hover:underline">complete a quick survey</a> to get personalized matches ranked for your podcast.</span>
                </div>
              </div>
            )}
            {showRateBanner && quizAnswers.category && quizAnswers.audienceSize === 'over-10k' && matches.length > 0 && CPM_RATES[quizAnswers.category] && (
              <div className="max-w-4xl mx-auto px-6 mb-4">
                <div className="flex items-start justify-between gap-4 px-5 py-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 text-base mt-0.5">💡</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300 mb-1">Your estimated rate range</p>
                      <p className="text-sm text-amber-200/70">
                        {CATEGORY_LABELS[quizAnswers.category] || quizAnswers.category} podcasts with 10k+ listeners typically earn
                      </p>
                      <p className="text-sm font-bold text-amber-300 mt-1">
                        ${CPM_RATES[quizAnswers.category].cpmLow}–${CPM_RATES[quizAnswers.category].cpmHigh} CPM
                        {' · '}
                        ${CPM_RATES[quizAnswers.category].epLow.toLocaleString()}–${CPM_RATES[quizAnswers.category].epHigh.toLocaleString()} per episode
                      </p>
                      <p className="text-xs text-amber-200/50 mt-1">Use these as your opening position when negotiating.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRateBanner(false)}
                    aria-label="Dismiss rate banner"
                    className="text-amber-500/60 hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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
