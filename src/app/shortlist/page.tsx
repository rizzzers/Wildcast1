'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/DashboardShell';
import { LockedField } from '@/components/LockedField';
import { OutreachModal } from '@/components/OutreachModal';
import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';

interface ShortlistContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  website: string | null;
  description: string | null;
  industries: string | null;
  tags: string | null;
  isUnlocked: boolean;
  isShortlisted: boolean;
  shortlistedAt: string;
}

export default function ShortlistPage() {
  const { status } = useSession();
  const [contacts, setContacts] = useState<ShortlistContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokensRemaining, setTokensRemaining] = useState(0);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ShortlistContact | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [listRes, tokenRes] = await Promise.all([
        fetch('/api/shortlist'),
        fetch('/api/tokens'),
      ]);
      if (listRes.ok) {
        const data = await listRes.json() as { contacts: ShortlistContact[] };
        setContacts(data.contacts);
      }
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json() as { tokensRemaining: number };
        setTokensRemaining(tokenData.tokensRemaining ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, fetchData]);

  const handleUnlock = async (contactId: string) => {
    setUnlockingId(contactId);
    try {
      const res = await fetch('/api/contacts/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      });
      const data = await res.json() as {
        contact?: { email: string | null; phone: string | null; linkedin: string | null };
        tokensRemaining?: number;
        error?: string;
      };
      if (res.ok && data.contact) {
        setContacts(prev => prev.map(c =>
          c.id === contactId
            ? { ...c, email: data.contact!.email, phone: data.contact!.phone, linkedin: data.contact!.linkedin, isUnlocked: true }
            : c
        ));
        if (data.tokensRemaining !== undefined) {
          setTokensRemaining(data.tokensRemaining);
        }
      }
    } catch {
      // ignore
    }
    setUnlockingId(null);
  };

  const handleRemoveFromShortlist = async (contactId: string) => {
    setRemovingId(contactId);
    try {
      await fetch('/api/shortlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      });
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch {
      // ignore
    }
    setRemovingId(null);
  };

  const contactToSponsor = (c: ShortlistContact): SponsorMatch => ({
    id: c.id,
    brandName: c.company,
    description: c.description ?? '',
    contactName: c.firstName,
    role: c.title,
    email: c.email,
    phone: c.phone,
    linkedin: c.linkedin,
    category: c.industries ?? '',
    budgetRange: '',
    audiencePreferences: [],
    preferredCategories: [],
    preferredTones: [],
    preferredFormats: [],
    matchScore: 0,
    matchReasons: [],
  });

  // Minimal quiz/podcast info for the outreach modal
  const dummyQuizAnswers: QuizAnswers = {};
  const dummyPodcastInfo: PodcastInfo = {
    email: '',
    podcastName: '',
    podcastUrl: '',
    description: '',
    hasMediaKit: false,
  };

  if (loading || status === 'loading') {
    return (
      <DashboardShell activeTab="shortlist">
        <div className="pt-24 text-center text-gray-400">Loading your shortlist...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activeTab="shortlist">
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Shortlist</h1>
            <p className="text-gray-400">
              Contacts you&apos;ve saved for later. {contacts.length} saved.
            </p>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
              </svg>
              <p className="text-gray-400 mb-4">No saved contacts yet.</p>
              <a
                href="/sponsors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-medium transition-colors"
              >
                Browse Partners to shortlist contacts
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">{contact.company}</div>
                      <div className="text-sm text-gray-400">
                        {contact.firstName} {contact.lastName} &middot; {contact.title}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromShortlist(contact.id)}
                      disabled={removingId === contact.id}
                      title="Remove from shortlist"
                      className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {contact.description && (
                        <p className="text-sm text-gray-400 mb-2">{contact.description}</p>
                      )}
                      {contact.industries && (
                        <p className="text-xs text-gray-500">{contact.industries}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-400">Email: </span>
                        {contact.isUnlocked ? (
                          contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-sm text-[var(--primary)] hover:underline">
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">Not available</span>
                          )
                        ) : (
                          <LockedField
                            onUnlock={() => handleUnlock(contact.id)}
                            isUnlocking={unlockingId === contact.id}
                            tokensRemaining={tokensRemaining}
                            label="Email"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Phone: </span>
                        {contact.isUnlocked ? (
                          contact.phone ? (
                            <span className="text-sm text-gray-300">{contact.phone}</span>
                          ) : (
                            <span className="text-sm text-gray-500">Not available</span>
                          )
                        ) : (
                          <LockedField
                            onUnlock={() => handleUnlock(contact.id)}
                            isUnlocking={unlockingId === contact.id}
                            tokensRemaining={tokensRemaining}
                            label="Phone"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">LinkedIn: </span>
                        {contact.isUnlocked ? (
                          contact.linkedin ? (
                            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] hover:underline">
                              View Profile
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">Not available</span>
                          )
                        ) : (
                          <LockedField
                            onUnlock={() => handleUnlock(contact.id)}
                            isUnlocking={unlockingId === contact.id}
                            tokensRemaining={tokensRemaining}
                            label="LinkedIn"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {contact.isUnlocked && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => { setSelectedContact(contact); setShowModal(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Email
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedContact && selectedContact.isUnlocked && (
        <OutreachModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sponsor={contactToSponsor(selectedContact)}
          quizAnswers={dummyQuizAnswers}
          podcastInfo={dummyPodcastInfo}
          onSend={() => {}}
          onTokenConsumed={() => setTokensRemaining(prev => Math.max(0, prev - 1))}
        />
      )}
    </DashboardShell>
  );
}
