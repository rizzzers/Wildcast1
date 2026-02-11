'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';
import { OutreachModal } from './OutreachModal';
import { AuthModal } from './AuthModal';

const STORAGE_KEY = 'wildcast_email_count';
const STORAGE_AUTH_KEY = 'wildcast_authenticated';

interface SponsorResultsProps {
  matches: SponsorMatch[];
  quizAnswers: QuizAnswers;
  podcastInfo: PodcastInfo;
}

export function SponsorResults({ matches, quizAnswers, podcastInfo }: SponsorResultsProps) {
  const router = useRouter();
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorMatch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [emailCount, setEmailCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const storedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
    if (storedCount) setEmailCount(parseInt(storedCount, 10));
    if (storedAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleEmailClick = (sponsor: SponsorMatch) => {
    setSelectedSponsor(sponsor);
    setShowModal(true);
  };

  const handleEmailSent = () => {
    if (selectedSponsor) {
      setSentEmails((prev) => new Set([...prev, selectedSponsor.id]));

      const newCount = emailCount + 1;
      setEmailCount(newCount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());

      // Show auth modal after first email if not authenticated
      if (!isAuthenticated && newCount >= 1) {
        setTimeout(() => setShowAuthModal(true), 500);
      }
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_AUTH_KEY, 'true');
    router.push('/profile');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Sponsor Matches
          </h1>
          <p className="text-gray-400 text-lg">
            We found {matches.length} sponsors that match your podcast vibe
          </p>
        </div>

        {/* Scorecard Summary */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Your Sponsorship Scorecard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Category</div>
              <div className="font-semibold capitalize">{quizAnswers.category?.replace('-', ' ')}</div>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Audience</div>
              <div className="font-semibold">10,000+</div>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Tone</div>
              <div className="font-semibold capitalize">{quizAnswers.tone?.replace('-', ' ')}</div>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Format</div>
              <div className="font-semibold capitalize">{quizAnswers.format}</div>
            </div>
          </div>
        </div>

        {/* Sponsor Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Description</th>
                  <th className="text-left p-4 font-semibold">Match</th>
                  <th className="text-right p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((sponsor, index) => (
                  <tr
                    key={sponsor.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="p-4">
                      <div className="font-semibold">{sponsor.brandName}</div>
                      <div className="text-sm text-gray-400">{sponsor.category}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-300 max-w-xs">{sponsor.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)]"
                            style={{ width: `${sponsor.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{sponsor.matchScore}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                        {sponsor.matchReasons.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEmailClick(sponsor)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-auto ${
                          sentEmails.has(sponsor.id)
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                        }`}
                      >
                        {sentEmails.has(sponsor.id) ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sent
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sponsor Cards */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((sponsor) => (
            <div
              key={sponsor.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{sponsor.brandName}</h3>
                  <p className="text-sm text-gray-400">{sponsor.category}</p>
                </div>
                <span className="px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium">
                  {sponsor.matchScore}%
                </span>
              </div>
              <div className="text-sm text-gray-300 mb-4">{sponsor.description}</div>
              <button
                onClick={() => handleEmailClick(sponsor)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  sentEmails.has(sponsor.id)
                    ? 'bg-[var(--success)]/20 text-[var(--success)]'
                    : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                }`}
              >
                {sentEmails.has(sponsor.id) ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email Sent
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Modal */}
      {selectedSponsor && (
        <OutreachModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sponsor={selectedSponsor}
          quizAnswers={quizAnswers}
          podcastInfo={podcastInfo}
          onSend={handleEmailSent}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
