'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { QuizAnswers, PodcastInfo, EmailContext } from '@/types';
import { ContactMatch } from '@/lib/contact-matching';
import { OutreachModal } from './OutreachModal';
import { AuthModal } from './AuthModal';
import { UnlockModal } from './UnlockModal';

const STORAGE_KEY = 'wildcast_email_count';
const STORAGE_AUTH_KEY = 'wildcast_authenticated';

type SortField = 'matchScore' | 'company' | 'contact';
type SortDir = 'asc' | 'desc';

interface SponsorResultsProps {
  matches: ContactMatch[];
  quizAnswers: QuizAnswers;
  podcastInfo: PodcastInfo | null;
  isLimited: boolean;
  outreachHistory: { sponsor_id: string; sent_at: string }[];
  isLocked?: boolean;
  onUnlock?: (info: PodcastInfo, accountInfo?: { name: string; password: string }) => void;
  onProfileContextSubmit?: (context: EmailContext) => void;
}

export function SponsorResults({ matches, quizAnswers, podcastInfo, isLimited, outreachHistory, isLocked = false, onUnlock, onProfileContextSubmit }: SponsorResultsProps) {
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<ContactMatch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [emailCount, setEmailCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Profile context banner state
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [profileContext, setProfileContext] = useState<EmailContext>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Show profile banner after unlock
  useEffect(() => {
    if (!isLocked && onProfileContextSubmit) {
      setShowProfileBanner(true);
    }
  }, [isLocked, onProfileContextSubmit]);

  // New state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('matchScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Initialize sentEmails from outreachHistory
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const storedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
    if (storedCount) setEmailCount(parseInt(storedCount, 10));
    if (storedAuth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (outreachHistory.length > 0) {
      setSentEmails(new Set(outreachHistory.map((o) => o.sponsor_id)));
    }
  }, [outreachHistory]);

  // Derived data
  const outreachMap = useMemo(() => {
    const map = new Map<string, string>();
    outreachHistory.forEach((o) => map.set(o.sponsor_id, o.sent_at));
    return map;
  }, [outreachHistory]);

  const displayMatches = useMemo(() => {
    let filtered = [...matches];

    // Search filter (only for Pro users — !isLimited)
    if (!isLimited && !isLocked && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.industries.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'matchScore') {
        cmp = a.matchScore - b.matchScore;
      } else if (sortField === 'company') {
        cmp = a.company.localeCompare(b.company);
      } else {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [matches, searchQuery, sortField, sortDir, isLimited, isLocked]);

  const contactedCount = sentEmails.size;
  const totalCount = matches.length;
  const allContacted = totalCount > 0 && contactedCount >= totalCount;
  const progressPct = totalCount > 0 ? (contactedCount / totalCount) * 100 : 0;

  const handleEmailClick = (contact: ContactMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      setShowUnlockModal(true);
      return;
    }
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleRowClick = (contact: ContactMatch) => {
    if (isLocked) {
      setShowUnlockModal(true);
      return;
    }
    setExpandedId(expandedId === contact.id ? null : contact.id);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'matchScore' ? 'desc' : 'asc');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-500">&#8597;</span>;
    return (
      <span className="ml-1" style={{ color: 'var(--primary)' }}>
        {sortDir === 'asc' ? '\u2191' : '\u2193'}
      </span>
    );
  };

  const handleProfileContextFormSubmit = async () => {
    if (!onProfileContextSubmit) return;
    setIsUpdatingProfile(true);
    const context: EmailContext = {
      unique_value_prop: profileContext.unique_value_prop || null,
      past_sponsors: profileContext.past_sponsors || null,
      audience_demographics: profileContext.audience_demographics || null,
      notable_guests: profileContext.notable_guests || null,
      additional_notes: profileContext.additional_notes || null,
    };
    await onProfileContextSubmit(context);
    setIsUpdatingProfile(false);
    setShowProfileBanner(false);
  };

  // Format listener type for scorecard
  const formatListenerType = () => {
    const lt = quizAnswers.listenerType;
    if (!lt) return 'Not set';
    if (Array.isArray(lt)) return lt.map((t) => t.replace(/-/g, ' ')).join(', ');
    return lt.replace(/-/g, ' ');
  };

  // Convert ContactMatch to the shape OutreachModal expects
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

  const renderEmailButton = (contact: ContactMatch, compact = false) => {
    if (isLocked) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); setShowUnlockModal(true); }}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Unlock
        </button>
      );
    }

    const isSent = sentEmails.has(contact.id);
    const sentDate = outreachMap.get(contact.id);
    return (
      <div className="flex flex-col items-end">
        <button
          onClick={(e) => handleEmailClick(contact, e)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isSent
              ? 'bg-[var(--success)]/20 text-[var(--success)]'
              : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
          }`}
        >
          {isSent ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Contacted
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
        {isSent && sentDate && !compact && (
          <span className="text-xs text-gray-400 mt-1">{formatDate(sentDate)}</span>
        )}
      </div>
    );
  };

  const renderExpandedPanel = (contact: ContactMatch) => {
    const sentDate = outreachMap.get(contact.id);
    return (
      <div className="px-6 py-5 bg-[var(--background)]/50 border-t border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {contact.description && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</div>
                <p className="text-sm text-gray-300">{contact.description}</p>
              </div>
            )}
            {contact.industries && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Industries</div>
                <p className="text-sm text-gray-300">{contact.industries}</p>
              </div>
            )}
            {contact.matchReasons.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Match Reasons</div>
                <ul className="space-y-1">
                  {contact.matchReasons.map((reason, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-[var(--primary)] mt-1.5 flex-shrink-0">&#8226;</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            {contact.phone && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Phone</div>
                <p className="text-sm text-gray-300">{contact.phone}</p>
              </div>
            )}
            {contact.website && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Website</div>
                <a
                  href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--primary)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contact.website}
                </a>
              </div>
            )}
            {contact.linkedin && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">LinkedIn</div>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--primary)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Profile
                </a>
              </div>
            )}
            {sentEmails.has(contact.id) && sentDate && (
              <div className="mt-4 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Contacted on {formatDate(sentDate)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEmailClick(contact, e); }}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Follow Up With Email
                  </button>
                  {contact.linkedin && (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-1.5 text-blue-400"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      Follow Up on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors resize-none text-sm';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Partner Contacts
          </h1>
          <p className="text-gray-400 text-lg">
            We found {matches.length} contacts that match your podcast
          </p>
          {isLimited && !isLocked && (
            <a
              href="/subscribe"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Upgrade to Pro for hundreds of potential partner matches
            </a>
          )}
        </div>

        {/* Unlock CTA Banner (locked state) */}
        {isLocked && (
          <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 rounded-2xl p-6 mb-8 animate-slide-in text-center">
            <div className="inline-block p-3 bg-[var(--primary)]/20 rounded-full mb-3">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Unlock Contact Details</h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              Enter your email and podcast info to reveal names, emails, and LinkedIn profiles for all {matches.length} matches.
            </p>
            <button
              onClick={() => setShowUnlockModal(true)}
              className="px-8 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Unlock My Matches
            </button>
          </div>
        )}

        {/* Profile Context Banner (after unlock) */}
        {!isLocked && showProfileBanner && onProfileContextSubmit && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Improve your matches</h3>
                <p className="text-sm text-gray-400">Add a few details about your podcast for better partner matching.</p>
              </div>
              <button
                onClick={() => setShowProfileBanner(false)}
                className="p-1.5 hover:bg-[var(--background)] rounded-full transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">What makes your podcast unique?</label>
                <textarea
                  value={profileContext.unique_value_prop || ''}
                  onChange={(e) => setProfileContext((p) => ({ ...p, unique_value_prop: e.target.value }))}
                  className={inputClasses}
                  rows={2}
                  placeholder="e.g. Only podcast interviewing Fortune 500 CTOs weekly"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">Past or current partners</label>
                <textarea
                  value={profileContext.past_sponsors || ''}
                  onChange={(e) => setProfileContext((p) => ({ ...p, past_sponsors: e.target.value }))}
                  className={inputClasses}
                  rows={2}
                  placeholder="e.g. Previously partnered with Stripe, AWS"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">Audience demographics</label>
                <textarea
                  value={profileContext.audience_demographics || ''}
                  onChange={(e) => setProfileContext((p) => ({ ...p, audience_demographics: e.target.value }))}
                  className={inputClasses}
                  rows={2}
                  placeholder="e.g. 70% male, 25-44, $120k+ HHI"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">Notable guests or achievements</label>
                <textarea
                  value={profileContext.notable_guests || ''}
                  onChange={(e) => setProfileContext((p) => ({ ...p, notable_guests: e.target.value }))}
                  className={inputClasses}
                  rows={2}
                  placeholder="e.g. Featured Y Combinator partners"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1 text-gray-400">Anything else partners should know</label>
                <textarea
                  value={profileContext.additional_notes || ''}
                  onChange={(e) => setProfileContext((p) => ({ ...p, additional_notes: e.target.value }))}
                  className={inputClasses}
                  rows={2}
                  placeholder="e.g. Open to custom integrations, live reads"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleProfileContextFormSubmit}
                disabled={isUpdatingProfile}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 font-semibold text-sm transition-all duration-200"
              >
                {isUpdatingProfile ? 'Updating...' : 'Update Matches'}
              </button>
              <button
                onClick={() => setShowProfileBanner(false)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Scorecard Summary */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Your Partnership Scorecard
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Category</div>
              <div className="font-semibold capitalize">{quizAnswers.category?.replace('-', ' ')}</div>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Audience</div>
              <div className="font-semibold">{quizAnswers.audienceSize === 'over-10k' ? '10,000+' : 'Under 10k'}</div>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div className="text-sm text-gray-400">Listener Type</div>
              <div className="font-semibold capitalize text-sm">{formatListenerType()}</div>
            </div>
          </div>
        </div>

        {/* Outreach Progress (hidden when locked) */}
        {!isLocked && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8 animate-slide-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Outreach Progress</h3>
              <span className="text-sm text-gray-400">{contactedCount} of {totalCount} contacted</span>
            </div>
            <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {allContacted && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
                <p className="text-[var(--success)] font-semibold mb-2">All contacts reached! Here are your next steps:</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-[var(--success)]">&#8226;</span>Wait 5-7 days before following up</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--success)]">&#8226;</span>Check your inbox for replies</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--success)]">&#8226;</span>Personalize your follow-ups with recent episodes</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--success)]">&#8226;</span>Update your media kit with latest stats</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Search & Filter (hidden when locked) */}
        {!isLocked && (
          <div className="mb-6 animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isLimited && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)]">
                    PRO
                  </span>
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLimited}
                  placeholder={isLimited ? 'Search contacts \u2014 Pro feature' : 'Search by company, name, or industry...'}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors ${
                    isLimited ? 'cursor-not-allowed opacity-60' : ''
                  } ${isLimited ? 'pr-16' : ''}`}
                />
              </div>
              {isLimited && (
                <a href="/subscribe" className="text-sm text-[var(--primary)] hover:underline whitespace-nowrap">
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>
        )}

        {/* Mobile Sort Pills (md:hidden) */}
        <div className="flex gap-2 mb-4 md:hidden overflow-x-auto pb-1">
          {([['contact', 'Contact'], ['company', 'Company'], ['matchScore', 'Match']] as [SortField, string][]).map(([field, label]) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                sortField === field
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-gray-400'
              }`}
            >
              {label} {sortField === field && (sortDir === 'asc' ? '\u2191' : '\u2193')}
            </button>
          ))}
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup><col className="w-[16%]" /><col className="w-[14%]" /><col className="w-[3rem]" /><col className="w-[22%]" /><col className="w-[18%] hidden lg:table-column" /><col className="w-[14%]" /><col className="w-[10%]" /></colgroup>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th
                    className="text-left p-4 font-semibold cursor-pointer select-none hover:text-[var(--primary)] transition-colors"
                    onClick={() => handleSort('contact')}
                  >
                    Name{sortArrow('contact')}
                  </th>
                  <th className="text-left p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold text-center">
                    <svg className="w-3.5 h-3.5 inline text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </th>
                  <th
                    className="text-left p-4 font-semibold cursor-pointer select-none hover:text-[var(--primary)] transition-colors"
                    onClick={() => handleSort('company')}
                  >
                    Company{sortArrow('company')}
                  </th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Industry</th>
                  <th
                    className="text-left p-4 font-semibold cursor-pointer select-none hover:text-[var(--primary)] transition-colors"
                    onClick={() => handleSort('matchScore')}
                  >
                    Match{sortArrow('matchScore')}
                  </th>
                  <th className="text-right p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayMatches.map((contact, index) => (
                  <Fragment key={contact.id}>
                    <tr
                      className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors cursor-pointer animate-slide-in ${
                        expandedId === contact.id ? 'bg-[var(--card-hover)]' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleRowClick(contact)}
                    >
                      <td className="p-4 overflow-hidden">
                        <div className={`font-semibold truncate ${isLocked ? 'blur-sm select-none' : ''}`}>
                          {contact.firstName} {contact.lastName}
                        </div>
                      </td>
                      <td className="p-4 overflow-hidden">
                        <div className="text-sm text-gray-400 truncate">{contact.title}</div>
                      </td>
                      <td className="p-4 text-center">
                        {contact.linkedin && (
                          isLocked ? (
                            <span className="text-blue-400/50 inline-block blur-sm select-none">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </span>
                          ) : (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                          )
                        )}
                      </td>
                      <td className="p-4 overflow-hidden">
                        <div className="font-medium truncate">{contact.company}</div>
                        <div className="text-sm text-gray-400 truncate">{contact.description}</div>
                      </td>
                      <td className="p-4 hidden lg:table-cell overflow-hidden">
                        <div className="text-sm text-gray-300 truncate">{contact.industries}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{contact.matchScore}%</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {renderEmailButton(contact)}
                          {!isLocked && (
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedId === contact.id ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </td>
                    </tr>
                    {!isLocked && expandedId === contact.id && (
                      <tr key={`${contact.id}-expanded`} className="border-b border-[var(--border)]">
                        <td colSpan={7}>
                          {renderExpandedPanel(contact)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout (md:hidden) */}
        <div className="md:hidden space-y-4">
          {displayMatches.map((contact, index) => (
            <div
              key={contact.id}
              className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-colors animate-slide-in ${
                !isLocked && expandedId === contact.id ? 'border-[var(--primary)]/30' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => handleRowClick(contact)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-lg">{contact.company}</div>
                    <div className={`text-sm text-gray-400 ${isLocked ? 'blur-sm select-none' : ''}`}>
                      {contact.firstName} {contact.lastName} &middot; {contact.title}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3 px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold">
                    {contact.matchScore}%
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {contact.matchReasons.slice(0, 2).map((reason, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[var(--background)] text-gray-400">
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  {renderEmailButton(contact, true)}
                  {!isLocked && (
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === contact.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              {!isLocked && expandedId === contact.id && (
                <div className="px-4 pb-4 border-t border-[var(--border)] pt-4" onClick={(e) => e.stopPropagation()}>
                  {contact.description && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</div>
                      <p className="text-sm text-gray-300">{contact.description}</p>
                    </div>
                  )}
                  {contact.matchReasons.length > 2 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">More Match Reasons</div>
                      <ul className="space-y-1">
                        {contact.matchReasons.slice(2).map((reason, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-[var(--primary)] mt-1.5 flex-shrink-0">&#8226;</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-400">Phone: </span>
                      <span className="text-sm text-gray-300">{contact.phone}</span>
                    </div>
                  )}
                  {contact.website && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-400">Website: </span>
                      <a
                        href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        {contact.website}
                      </a>
                    </div>
                  )}
                  {contact.linkedin && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-400">LinkedIn: </span>
                      <a
                        href={contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {sentEmails.has(contact.id) && outreachMap.get(contact.id) && (
                    <div className="mt-3 space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Contacted on {formatDate(outreachMap.get(contact.id)!)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEmailClick(contact, e); }}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Follow Up With Email
                        </button>
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-1.5 text-blue-400"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            Follow Up on LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Outreach Modal (only when unlocked) */}
      {!isLocked && selectedContact && podcastInfo && (
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

      {/* Unlock Modal */}
      {onUnlock && (
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onUnlock={(info, accountInfo) => {
            setShowUnlockModal(false);
            onUnlock(info, accountInfo);
          }}
        />
      )}
    </div>
  );
}
