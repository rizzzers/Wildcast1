'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { AuthModal } from '@/components/AuthModal';
import { NavBar } from '@/components/NavBar';
import { quizQuestions } from '@/data/quiz-options';
import Link from 'next/link';

type Tab = 'overview' | 'outreach' | 'personalize' | 'settings';

interface OutreachRecord {
  id: string;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  contact_role: string | null;
  template_used: string | null;
  sent_at: string;
}

interface ProfileData {
  user: { id: string; email: string; name: string; role: string; created_at: string };
  submission: {
    category: string | null; audience_size: string | null; listener_type: string | null;
    tone: string | null; release_frequency: string | null; format: string | null;
    primary_goal: string | null; podcast_name: string | null; podcast_url: string | null;
    description: string | null; has_media_kit: number;
  } | null;
  outreach: OutreachRecord[];
  emailContext: {
    unique_value_prop: string | null; past_sponsors: string | null;
    audience_demographics: string | null; notable_guests: string | null;
    additional_notes: string | null;
  } | null;
}

// Sparkline chart component
function Sparkline({ data }: { data: number[] }) {
  if (data.every((v) => v === 0)) {
    return (
      <div className="h-16 flex items-end">
        <svg viewBox="0 0 300 64" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="60" x2="300" y2="60" stroke="var(--border)" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 300;
      const y = 60 - (v / max) * 52;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,60 ${points} 300,60`;

  return (
    <div className="h-16">
      <svg viewBox="0 0 300 64" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#sparkGrad)" />
        <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function buildSparklineData(outreach: OutreachRecord[]): number[] {
  const days = 30;
  const counts: number[] = Array(days).fill(0);
  const now = new Date();
  outreach.forEach((r) => {
    const diff = Math.floor((now.getTime() - new Date(r.sent_at).getTime()) / 86400000);
    if (diff >= 0 && diff < days) counts[days - 1 - diff]++;
  });
  return counts;
}

function ProfilePageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const activeTab: Tab = (searchParams.get('tab') as Tab) || 'overview';
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);

  // Form state — Settings tab
  const [name, setName] = useState('');
  const [podcastName, setPodcastName] = useState('');
  const [podcastUrl, setPodcastUrl] = useState('');
  const [description, setDescription] = useState('');
  const [hasMediaKit, setHasMediaKit] = useState(false);
  const [category, setCategory] = useState('');
  const [audienceSize, setAudienceSize] = useState('');
  const [listenerType, setListenerType] = useState('');
  const [tone, setTone] = useState('');
  const [releaseFrequency, setReleaseFrequency] = useState('');
  const [format, setFormat] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');

  // Form state — Personalize tab
  const [uniqueValueProp, setUniqueValueProp] = useState('');
  const [pastSponsors, setPastSponsors] = useState('');
  const [audienceDemographics, setAudienceDemographics] = useState('');
  const [notableGuests, setNotableGuests] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then((r) => r.json() as Promise<ProfileData & { error?: string }>)
        .then((data) => {
          if (!data.error) {
            setProfileData(data);
            setName(data.user?.name || '');
            setPodcastName(data.submission?.podcast_name || '');
            setPodcastUrl(data.submission?.podcast_url || '');
            setDescription(data.submission?.description || '');
            setHasMediaKit(!!data.submission?.has_media_kit);
            setCategory(data.submission?.category || '');
            setAudienceSize(data.submission?.audience_size || '');
            setListenerType(data.submission?.listener_type || '');
            setTone(data.submission?.tone || '');
            setReleaseFrequency(data.submission?.release_frequency || '');
            setFormat(data.submission?.format || '');
            setPrimaryGoal(data.submission?.primary_goal || '');
            setUniqueValueProp(data.emailContext?.unique_value_prop || '');
            setPastSponsors(data.emailContext?.past_sponsors || '');
            setAudienceDemographics(data.emailContext?.audience_demographics || '');
            setNotableGuests(data.emailContext?.notable_guests || '');
            setAdditionalNotes(data.emailContext?.additional_notes || '');
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));

      fetch('/api/gmail/status')
        .then((r) => r.json() as Promise<{ connected: boolean; email: string | null }>)
        .then((d) => { setGmailConnected(d.connected); setGmailEmail(d.email); })
        .catch(() => {});
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          submission: {
            category: category || null, audience_size: audienceSize || null,
            listener_type: listenerType || null, tone: tone || null,
            release_frequency: releaseFrequency || null, format: format || null,
            primary_goal: primaryGoal || null, email: profileData?.user.email,
            podcast_name: podcastName || null, podcast_url: podcastUrl || null,
            description: description || null, has_media_kit: hasMediaKit,
          },
          emailContext: {
            unique_value_prop: uniqueValueProp || null, past_sponsors: pastSponsors || null,
            audience_demographics: audienceDemographics || null,
            notable_guests: notableGuests || null, additional_notes: additionalNotes || null,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleGmailDisconnect = async () => {
    setIsDisconnecting(true);
    await fetch('/api/gmail/disconnect', { method: 'POST' }).catch(() => {});
    setGmailConnected(false);
    setGmailEmail(null);
    setIsDisconnecting(false);
  };

  const inputClasses = 'w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors text-sm';
  const labelClasses = 'block text-sm font-medium mb-1.5 text-gray-300';
  const selectClasses = `${inputClasses} appearance-none`;

  const stateMap: Record<string, { value: string; setter: (v: string) => void }> = {
    category: { value: category, setter: setCategory },
    audienceSize: { value: audienceSize, setter: setAudienceSize },
    listenerType: { value: listenerType, setter: setListenerType },
    tone: { value: tone, setter: setTone },
    releaseFrequency: { value: releaseFrequency, setter: setReleaseFrequency },
    format: { value: format, setter: setFormat },
    primaryGoal: { value: primaryGoal, setter: setPrimaryGoal },
  };

  // Unauthenticated state
  if (!loading && !session) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <main className="pt-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Sign in to access your dashboard</h2>
            <p className="text-gray-400 mb-6">Manage your profile, track outreach, and connect your Gmail account.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-semibold transition-colors"
            >
              Sign In / Create Account
            </button>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
          </div>
        </main>
      </div>
    );
  }

  const outreach = profileData?.outreach ?? [];
  const sparklineData = buildSparklineData(outreach);
  const thisMonth = outreach.filter((r) => {
    const d = new Date(r.sent_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const brandsContacted = new Set(outreach.map((r) => r.brand_name)).size;

  return (
    <DashboardShell activeTab={activeTab}>
      {loading ? (
        <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
      ) : (
        <div className="p-8 max-w-4xl">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Overview</h1>
                <p className="text-gray-400 text-sm mt-1">Your sponsorship outreach at a glance</p>
              </div>

              {/* Gmail warning banner */}
              {!gmailConnected && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 text-sm text-yellow-300">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    Gmail not connected — you won&apos;t be able to send outreach emails.
                  </div>
                  <Link href="/profile?tab=settings" scroll={false} className="text-xs text-yellow-400 hover:text-yellow-300 font-medium shrink-0 ml-4">
                    Connect Gmail →
                  </Link>
                </div>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Emails Sent', value: outreach.length },
                  { label: 'Brands Contacted', value: brandsContacted },
                  { label: 'This Month', value: thisMonth },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Activity chart */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Outreach Activity</h2>
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <Sparkline data={sparklineData} />
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Recent outreach */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                  <h2 className="font-semibold">Recent Outreach</h2>
                  {outreach.length > 0 && (
                    <Link href="/profile?tab=outreach" scroll={false} className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                      View all →
                    </Link>
                  )}
                </div>
                {outreach.length === 0 ? (
                  <div className="px-6 py-10 text-center text-gray-500 text-sm">
                    No emails sent yet.{' '}
                    <Link href="/sponsors" className="text-[var(--primary)] hover:underline">
                      Find sponsors to contact.
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {outreach.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-sm font-medium">{r.brand_name}</p>
                          <p className="text-xs text-gray-500">{r.contact_name}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(r.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── OUTREACH HISTORY ── */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Outreach History</h1>
                <p className="text-gray-400 text-sm mt-1">{outreach.length} email{outreach.length !== 1 ? 's' : ''} sent</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                {outreach.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-500">
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No emails sent yet.</p>
                    <Link href="/sponsors" className="text-[var(--primary)] hover:underline text-sm mt-1 inline-block">
                      Browse sponsors →
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs text-gray-500 uppercase tracking-wider">
                          <th className="text-left px-6 py-3">Brand</th>
                          <th className="text-left px-6 py-3">Contact</th>
                          <th className="text-left px-6 py-3 hidden md:table-cell">Email</th>
                          <th className="text-left px-6 py-3 hidden lg:table-cell">Template</th>
                          <th className="text-left px-6 py-3">Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {outreach.map((r) => (
                          <tr key={r.id} className="hover:bg-[var(--card-hover)] transition-colors">
                            <td className="px-6 py-3 text-sm font-medium">{r.brand_name}</td>
                            <td className="px-6 py-3 text-sm">
                              <p>{r.contact_name}</p>
                              {r.contact_role && <p className="text-xs text-gray-500">{r.contact_role}</p>}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-400 hidden md:table-cell">
                              <a href={`mailto:${r.contact_email}`} className="hover:text-white transition-colors">{r.contact_email}</a>
                            </td>
                            <td className="px-6 py-3 hidden lg:table-cell">
                              <span className="text-xs px-2 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] text-gray-400">
                                {r.template_used ?? 'custom'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(r.sent_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PERSONALIZE ── */}
          {activeTab === 'personalize' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Personalize</h1>
                <p className="text-gray-400 text-sm mt-1">This info is woven into your outreach emails to make them more persuasive.</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                {[
                  { label: 'What makes your podcast unique?', value: uniqueValueProp, setter: setUniqueValueProp, placeholder: 'e.g. Only podcast interviewing Fortune 500 CTOs weekly, 95% completion rate' },
                  { label: 'Past or current sponsors', value: pastSponsors, setter: setPastSponsors, placeholder: 'e.g. Previously sponsored by Stripe, AWS, and Linear' },
                  { label: 'Audience demographics', value: audienceDemographics, setter: setAudienceDemographics, placeholder: 'e.g. 70% male, 25-44, $120k+ HHI, 60% US-based' },
                  { label: 'Notable guests or achievements', value: notableGuests, setter: setNotableGuests, placeholder: 'e.g. Featured guests include Y Combinator partners' },
                  { label: 'Anything else sponsors should know', value: additionalNotes, setter: setAdditionalNotes, placeholder: 'e.g. Open to custom integrations, live reads, host-read only' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className={labelClasses}>{field.label}</label>
                    <textarea
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className={`${inputClasses} resize-none`}
                      rows={2}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl font-medium transition-colors text-sm"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-[var(--success)] text-sm">Saved</span>}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your account, Gmail connection, and podcast details.</p>
              </div>

              {/* Account card */}
              <section>
                <h2 className="text-base font-semibold mb-3">Account</h2>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
                  <div>
                    <label className={labelClasses}>Email</label>
                    <div className="px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-gray-400 text-sm">
                      {profileData?.user.email}
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Member since</label>
                    <div className="px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-gray-400 text-sm">
                      {profileData?.user.created_at ? new Date(profileData.user.created_at).toLocaleDateString() : '—'}
                    </div>
                  </div>

                  {/* Gmail */}
                  <div>
                    <label className={labelClasses}>Gmail Integration</label>
                    {gmailConnected ? (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--background)] border border-green-500/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                          <span className="text-sm text-gray-300">{gmailEmail ?? 'Connected'}</span>
                        </div>
                        <button
                          onClick={handleGmailDisconnect}
                          disabled={isDisconnecting}
                          className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                        >
                          {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      </div>
                    ) : (
                      <a
                        href="/api/gmail"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)] transition-colors group"
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[var(--primary)] transition-colors shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                          Connect Gmail to send outreach emails from your account
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </section>

              {/* Podcast card */}
              <section>
                <h2 className="text-base font-semibold mb-3">Podcast</h2>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
                  <div>
                    <label className={labelClasses}>Podcast Name</label>
                    <input type="text" value={podcastName} onChange={(e) => setPodcastName(e.target.value)} className={inputClasses} placeholder="My Podcast" />
                  </div>
                  <div>
                    <label className={labelClasses}>Podcast URL</label>
                    <input type="url" value={podcastUrl} onChange={(e) => setPodcastUrl(e.target.value)} className={inputClasses} placeholder="https://podcasts.apple.com/..." />
                  </div>
                  <div>
                    <label className={labelClasses}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClasses} resize-none`} rows={3} placeholder="What's your show about?" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="hasMediaKit" checked={hasMediaKit} onChange={(e) => setHasMediaKit(e.target.checked)} className="w-4 h-4 rounded border-[var(--border)]" />
                    <label htmlFor="hasMediaKit" className="text-sm text-gray-300">I have a media kit ready for sponsors</label>
                  </div>
                </div>
              </section>

              {/* Survey answers */}
              <section>
                <h2 className="text-base font-semibold mb-3">Survey Answers</h2>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
                  {quizQuestions.map((q) => {
                    const state = stateMap[q.id];
                    if (!state) return null;
                    return (
                      <div key={q.id}>
                        <label className={labelClasses}>{q.question}</label>
                        <select value={state.value} onChange={(e) => state.setter(e.target.value)} className={selectClasses}>
                          <option value="">Select...</option>
                          {q.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl font-medium transition-colors text-sm"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-[var(--success)] text-sm">Saved</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[var(--background)] text-gray-500">Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
