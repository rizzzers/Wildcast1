'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/components/Quiz';
import { SponsorResults } from '@/components/SponsorResults';
import { GrowthPlan } from '@/components/GrowthPlan';
import { Consultation } from '@/components/Consultation';
import { AuthModal } from '@/components/AuthModal';
import { QuizAnswers, PodcastInfo, EmailContext, GrowthPlan as GrowthPlanType, AppStep } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';

const STORAGE_QUIZ_KEY = 'howdi_pending_quiz';
const STORAGE_PODCAST_KEY = 'howdi_pending_podcast';

export default function SurveyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<AppStep>('quiz');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [podcastInfo, setPodcastInfo] = useState<PodcastInfo | null>(null);
  const [contactMatches, setContactMatches] = useState<ContactMatch[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlanType | null>(null);

  // Register step form state
  const [regPodcastName, setRegPodcastName] = useState('');
  const [regPodcastUrl, setRegPodcastUrl] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regHasMediaKit, setRegHasMediaKit] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const recoveredRef = useRef(false);

  const LOADING_MESSAGES = [
    'Analyzing your podcast...',
    'Scanning 1,000+ active sponsors...',
    'Ranking your best fits with AI...',
    'Almost ready...',
  ];

  useEffect(() => {
    if (step !== 'loading') return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 1300);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // After Google OAuth redirect: recover saved quiz + podcast state and run contacts
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) return;
    if (recoveredRef.current) return;

    const savedQuiz = sessionStorage.getItem(STORAGE_QUIZ_KEY);
    const savedPodcast = sessionStorage.getItem(STORAGE_PODCAST_KEY);
    if (!savedQuiz || !savedPodcast) return;

    recoveredRef.current = true;
    sessionStorage.removeItem(STORAGE_QUIZ_KEY);
    sessionStorage.removeItem(STORAGE_PODCAST_KEY);

    try {
      const answers = JSON.parse(savedQuiz) as QuizAnswers;
      const podcast = JSON.parse(savedPodcast) as PodcastInfo;
      // Fill email from Google session if empty
      podcast.email = podcast.email || session.user.email || '';
      setQuizAnswers(answers);
      setPodcastInfo(podcast);
      void runContactsFlow(answers, podcast);
    } catch {
      // ignore parse errors — user can retake
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Core function: persist survey then redirect to dashboard
  const runContactsFlow = async (answers: QuizAnswers, podcast: PodcastInfo) => {
    setStep('loading');

    // Persist survey submission
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          email: podcast.email,
          podcastName: podcast.podcastName,
          podcastUrl: podcast.podcastUrl,
          description: podcast.description,
          hasMediaKit: podcast.hasMediaKit,
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
        body: JSON.stringify(podcast),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Redirect to dashboard — /sponsors fetches contacts with the saved survey
    router.push('/sponsors');
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);

    if (answers.audienceSize === 'under-10k') {
      setStep('consultation');
      return;
    }

    // Already authenticated — skip registration, go straight to dashboard
    if (session?.user) {
      router.push('/sponsors');
      return;
    }

    setStep('register');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPodcastName || !regPodcastUrl || !regEmail || !regPassword) return;

    setRegSubmitting(true);
    setRegError('');

    const podcast: PodcastInfo = {
      email: regEmail,
      podcastName: regPodcastName,
      podcastUrl: regPodcastUrl,
      description: regDescription,
      hasMediaKit: regHasMediaKit,
    };
    setPodcastInfo(podcast);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName || regEmail.split('@')[0],
        }),
      });

      if (!res.ok) {
        const data = await res.json() as Record<string, any>;
        // Email already exists — try signing in
        if (res.status === 409 || data.error?.toLowerCase().includes('exist')) {
          const result = await signIn('credentials', { email: regEmail, password: regPassword, redirect: false });
          if (result?.error) {
            setRegError('An account with this email exists. Check your password.');
            setRegSubmitting(false);
            return;
          }
        } else {
          setRegError(data.error || 'Failed to create account');
          setRegSubmitting(false);
          return;
        }
      } else {
        await signIn('credentials', { email: regEmail, password: regPassword, redirect: false });
      }
    } catch {
      setRegError('Something went wrong. Please try again.');
      setRegSubmitting(false);
      return;
    }

    setRegSubmitting(false);
    await runContactsFlow(quizAnswers, podcast);
  };

  const handleGoogleRegister = () => {
    if (!regPodcastName || !regPodcastUrl) {
      setRegError('Please enter your podcast name and URL before continuing with Google.');
      return;
    }
    setRegError('');
    const podcast: PodcastInfo = {
      email: '', // filled from Google session on return
      podcastName: regPodcastName,
      podcastUrl: regPodcastUrl,
      description: regDescription,
      hasMediaKit: regHasMediaKit,
    };
    sessionStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(quizAnswers));
    sessionStorage.setItem(STORAGE_PODCAST_KEY, JSON.stringify(podcast));
    void signIn('google', { callbackUrl: window.location.href });
  };

  const handleProfileContextUpdate = async (context: EmailContext) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContext: context }),
      });
    } catch (error) {
      console.error('Failed to save profile context:', error);
    }

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers, podcastInfo, emailContext: context }),
      });
      const data = await res.json() as Record<string, any>;
      setContactMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (error) {
      console.error('Failed to re-fetch contact matches:', error);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors';

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
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
            )}
            {session?.user ? (
              <>
                <Link href="/profile" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Profile
                </Link>
                {session.user.plan !== 'pro' && (
                  <Link href="/subscribe" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                    Upgrade to Pro
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />

      <main className="pt-20">
        {step === 'quiz' && <Quiz onComplete={handleQuizComplete} />}

        {step === 'register' && (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 mb-4">
                  Last step
                </div>
                <h2 className="text-3xl font-bold mb-2">Get your partner matches</h2>
                <p className="text-gray-400 text-sm">Create a free account to see your AI-matched sponsor contacts</p>
              </div>

              {regError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  {regError}
                </div>
              )}

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                {/* Podcast info */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Podcast</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={regPodcastName}
                      onChange={e => setRegPodcastName(e.target.value)}
                      placeholder="Podcast name *"
                      className={inputClass}
                    />
                    <input
                      type="url"
                      value={regPodcastUrl}
                      onChange={e => setRegPodcastUrl(e.target.value)}
                      placeholder="Podcast URL * (Apple, Spotify, etc.)"
                      className={inputClass}
                    />
                    <textarea
                      value={regDescription}
                      onChange={e => setRegDescription(e.target.value)}
                      placeholder="Brief description (optional)"
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regHasMediaKit}
                        onChange={e => setRegHasMediaKit(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      I have a media kit ready
                    </label>
                  </div>
                </div>

                <div className="border-t border-[var(--border)]" />

                {/* Google sign-in (prominent) */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={regSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-colors disabled:opacity-50 font-medium text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-[var(--border)]" />
                  <span className="text-xs text-gray-500">or create with email</span>
                  <div className="flex-1 border-t border-[var(--border)]" />
                </div>

                {/* Email/password */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="Email address *"
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Your name (optional)"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Password * (min 8 characters)"
                    minLength={8}
                    required
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={!regPodcastName || !regPodcastUrl || !regEmail || !regPassword || regSubmitting}
                    className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {regSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Get My Matches'
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                We&apos;ll never share your information. Unsubscribe anytime.
              </p>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-3">{LOADING_MESSAGES[loadingMsgIndex]}</h2>
              <p className="text-gray-400 text-sm mb-8">Using AI to find sponsors who actually buy podcast ads</p>
              <div className="h-1.5 bg-[var(--card)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all ease-linear"
                  style={{ width: `${((loadingMsgIndex + 1) / LOADING_MESSAGES.length) * 100}%`, transitionDuration: '1.2s' }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-4">Step {loadingMsgIndex + 1} of {LOADING_MESSAGES.length}</p>
            </div>
          </div>
        )}

        {step === 'results' && (
          <SponsorResults
            matches={contactMatches}
            quizAnswers={quizAnswers}
            podcastInfo={podcastInfo}
            isLimited={false}
            outreachHistory={[]}
            isLocked={false}
            onProfileContextSubmit={handleProfileContextUpdate}
          />
        )}

        {step === 'growth-plan' && growthPlan && (
          <GrowthPlan quizAnswers={quizAnswers} growthPlan={growthPlan} />
        )}

        {step === 'consultation' && (
          <Consultation quizAnswers={quizAnswers} />
        )}
      </main>
    </div>
  );
}
