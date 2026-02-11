'use client';

import { useState } from 'react';
import { quizQuestions } from '@/data/quiz-options';

interface OutreachRecord {
  id: string;
  sponsor_id: string;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  contact_role: string | null;
  template_used: string | null;
  sent_at: string;
}

interface EmailContextData {
  unique_value_prop: string | null;
  past_sponsors: string | null;
  audience_demographics: string | null;
  notable_guests: string | null;
  additional_notes: string | null;
}

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  };
  submission: {
    id: string;
    category: string | null;
    audience_size: string | null;
    listener_type: string | null;
    tone: string | null;
    release_frequency: string | null;
    format: string | null;
    primary_goal: string | null;
    email: string | null;
    podcast_name: string | null;
    podcast_url: string | null;
    description: string | null;
    has_media_kit: number;
  } | null;
  outreach: OutreachRecord[];
  emailContext: EmailContextData | null;
}

interface ProfileFormProps {
  data: ProfileData;
}

export function ProfileForm({ data }: ProfileFormProps) {
  const [name, setName] = useState(data.user.name || '');
  const [podcastName, setPodcastName] = useState(data.submission?.podcast_name || '');
  const [podcastUrl, setPodcastUrl] = useState(data.submission?.podcast_url || '');
  const [description, setDescription] = useState(data.submission?.description || '');
  const [hasMediaKit, setHasMediaKit] = useState(!!data.submission?.has_media_kit);
  const [category, setCategory] = useState(data.submission?.category || '');
  const [audienceSize, setAudienceSize] = useState(data.submission?.audience_size || '');
  const [listenerType, setListenerType] = useState(data.submission?.listener_type || '');
  const [tone, setTone] = useState(data.submission?.tone || '');
  const [releaseFrequency, setReleaseFrequency] = useState(data.submission?.release_frequency || '');
  const [format, setFormat] = useState(data.submission?.format || '');
  const [primaryGoal, setPrimaryGoal] = useState(data.submission?.primary_goal || '');

  // Email context fields
  const [uniqueValueProp, setUniqueValueProp] = useState(data.emailContext?.unique_value_prop || '');
  const [pastSponsors, setPastSponsors] = useState(data.emailContext?.past_sponsors || '');
  const [audienceDemographics, setAudienceDemographics] = useState(data.emailContext?.audience_demographics || '');
  const [notableGuests, setNotableGuests] = useState(data.emailContext?.notable_guests || '');
  const [additionalNotes, setAdditionalNotes] = useState(data.emailContext?.additional_notes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const stateMap: Record<string, { value: string; setter: (v: string) => void }> = {
    category: { value: category, setter: setCategory },
    audienceSize: { value: audienceSize, setter: setAudienceSize },
    listenerType: { value: listenerType, setter: setListenerType },
    tone: { value: tone, setter: setTone },
    releaseFrequency: { value: releaseFrequency, setter: setReleaseFrequency },
    format: { value: format, setter: setFormat },
    primaryGoal: { value: primaryGoal, setter: setPrimaryGoal },
  };

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
            category: category || null,
            audience_size: audienceSize || null,
            listener_type: listenerType || null,
            tone: tone || null,
            release_frequency: releaseFrequency || null,
            format: format || null,
            primary_goal: primaryGoal || null,
            email: data.user.email,
            podcast_name: podcastName || null,
            podcast_url: podcastUrl || null,
            description: description || null,
            has_media_kit: hasMediaKit,
          },
          emailContext: {
            unique_value_prop: uniqueValueProp || null,
            past_sponsors: pastSponsors || null,
            audience_demographics: audienceDemographics || null,
            notable_guests: notableGuests || null,
            additional_notes: additionalNotes || null,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = 'w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors';
  const selectClasses = 'w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors appearance-none';
  const labelClasses = 'block text-sm font-medium mb-2';

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <div>
            <label className={labelClasses}>Email</label>
            <div className="px-4 py-3 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] text-gray-400">
              {data.user.email}
            </div>
          </div>
          <div>
            <label className={labelClasses}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Member since</label>
            <div className="px-4 py-3 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] text-gray-400">
              {new Date(data.user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Podcast Info</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <div>
            <label className={labelClasses}>Podcast Name</label>
            <input
              type="text"
              value={podcastName}
              onChange={(e) => setPodcastName(e.target.value)}
              className={inputClasses}
              placeholder="My Podcast"
            />
          </div>
          <div>
            <label className={labelClasses}>Podcast URL</label>
            <input
              type="url"
              value={podcastUrl}
              onChange={(e) => setPodcastUrl(e.target.value)}
              className={inputClasses}
              placeholder="https://podcasts.apple.com/..."
            />
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={3}
              placeholder="What's your show about?"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasMediaKit"
              checked={hasMediaKit}
              onChange={(e) => setHasMediaKit(e.target.checked)}
              className="w-5 h-5 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <label htmlFor="hasMediaKit" className="text-sm text-gray-300">
              I have a media kit ready for sponsors
            </label>
          </div>
        </div>
      </section>

      {/* Email Context - influences email generation */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Email Context</h2>
        <p className="text-sm text-gray-400 mb-4">
          This information is woven into your outreach emails to make them more personal and persuasive.
        </p>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <div>
            <label className={labelClasses}>What makes your podcast unique?</label>
            <textarea
              value={uniqueValueProp}
              onChange={(e) => setUniqueValueProp(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="e.g. Only podcast interviewing Fortune 500 CTOs weekly, 95% completion rate"
            />
          </div>
          <div>
            <label className={labelClasses}>Past or current sponsors</label>
            <textarea
              value={pastSponsors}
              onChange={(e) => setPastSponsors(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="e.g. Previously sponsored by Stripe, AWS, and Linear"
            />
          </div>
          <div>
            <label className={labelClasses}>Audience demographics</label>
            <textarea
              value={audienceDemographics}
              onChange={(e) => setAudienceDemographics(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="e.g. 70% male, 25-44, $120k+ HHI, 60% US-based"
            />
          </div>
          <div>
            <label className={labelClasses}>Notable guests or achievements</label>
            <textarea
              value={notableGuests}
              onChange={(e) => setNotableGuests(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="e.g. Featured guests include Y Combinator partners, Top 50 in Tech on Apple Podcasts"
            />
          </div>
          <div>
            <label className={labelClasses}>Anything else sponsors should know</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="e.g. Open to custom integrations, live reads, host-read only"
            />
          </div>
        </div>
      </section>

      {/* Survey Answers */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Survey Answers</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          {quizQuestions.map((q) => {
            const state = stateMap[q.id];
            if (!state) return null;
            return (
              <div key={q.id}>
                <label className={labelClasses}>{q.question}</label>
                <select
                  value={state.value}
                  onChange={(e) => state.setter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select...</option>
                  {q.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-[var(--success)] text-sm animate-fade-in">
            Changes saved
          </span>
        )}
      </div>

      {/* Outreach History */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Sent Outreach</h2>
        {data.outreach.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center text-gray-500">
            No emails sent yet. Complete the survey and reach out to sponsors to see your history here.
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left p-4 font-semibold text-sm">Brand</th>
                    <th className="text-left p-4 font-semibold text-sm">Contact</th>
                    <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">Email</th>
                    <th className="text-left p-4 font-semibold text-sm hidden lg:table-cell">Template</th>
                    <th className="text-left p-4 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outreach.map((record) => (
                    <tr key={record.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-sm">{record.brand_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{record.contact_name}</div>
                        {record.contact_role && (
                          <div className="text-xs text-gray-500">{record.contact_role}</div>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <a
                          href={`mailto:${record.contact_email}`}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          {record.contact_email}
                        </a>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs px-2 py-1 bg-[var(--card-hover)] rounded-full capitalize">
                          {record.template_used || 'custom'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(record.sent_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
