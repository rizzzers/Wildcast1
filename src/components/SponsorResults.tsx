'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizAnswers, PodcastInfo } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';
import { OutreachModal } from './OutreachModal';
import { AuthModal } from './AuthModal';

const STORAGE_KEY = 'wildcast_email_count';
const STORAGE_AUTH_KEY = 'wildcast_authenticated';

interface SponsorResultsProps {
  matches: ContactMatch[];
  quizAnswers: QuizAnswers;
  podcastInfo: PodcastInfo;
}

export function SponsorResults({ matches, quizAnswers, podcastInfo }: SponsorResultsProps) {
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<ContactMatch | null>(null);
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

  const handleEmailClick = (contact: ContactMatch) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleEmailSent = () => {
    if (selectedContact) {
      setSentEmails((prev) => new Set([...prev, selectedContact.id]));

      const newCount = emailCount + 1;
      setEmailCount(newCount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());

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

  // Convert ContactMatch to the shape OutreachModal expects (SponsorMatch-like)
  const contactToSponsor = (c: ContactMatch) => ({
    id: c.id,
    brandName: c.company,
    description: c.description,
    contactName: c.firstName,
    role: c.title,
    email: c.email,
    phone: c.phone,
    linkedin: c.linkedin || '',
    category: c.industries,
    budgetRange: '',
    audiencePreferences: [],
    preferredCategories: [],
    preferredTones: [],
    preferredFormats: [],
    matchScore: c.matchScore,
    matchReasons: c.matchReasons,
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Sponsor Contacts
          </h1>
          <p className="text-gray-400 text-lg">
            We found {matches.length} contacts that match your podcast
          </p>
        </div>

        {/* Scorecard Summary */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Your Sponsorship Scorecard
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

        {/* Contact Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 font-semibold">Contact</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Company</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Industry</th>
                  <th className="text-left p-4 font-semibold">Match</th>
                  <th className="text-right p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <div className="font-semibold">
                        {contact.firstName} {contact.lastName}
                        {contact.linkedin && (
                          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="inline-block ml-1.5 text-blue-400 hover:text-blue-300 align-middle">
                            <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{contact.title}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="font-medium">{contact.company}</div>
                      <div className="text-sm text-gray-400 max-w-xs truncate">{contact.description}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-300 max-w-xs truncate">{contact.industries}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)]"
                            style={{ width: `${contact.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{contact.matchScore}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                        {contact.matchReasons.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEmailClick(contact)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-auto ${
                          sentEmails.has(contact.id)
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                        }`}
                      >
                        {sentEmails.has(contact.id) ? (
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

        {/* Contact Cards */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((contact) => (
            <div
              key={contact.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{contact.company}</h3>
                  <p className="text-sm text-gray-400">{contact.firstName} {contact.lastName}</p>
                  <p className="text-xs text-gray-500">{contact.title}</p>
                </div>
                <span className="px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium">
                  {contact.matchScore}%
                </span>
              </div>
              <div className="text-sm text-gray-300 mb-2">{contact.description}</div>
              <div className="text-xs text-gray-500 mb-3">{contact.industries}</div>
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mb-3"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
              <button
                onClick={() => handleEmailClick(contact)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  sentEmails.has(contact.id)
                    ? 'bg-[var(--success)]/20 text-[var(--success)]'
                    : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                }`}
              >
                {sentEmails.has(contact.id) ? (
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
      {selectedContact && (
        <OutreachModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sponsor={contactToSponsor(selectedContact)}
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
