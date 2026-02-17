'use client';

import { useState } from 'react';
import { EmailContext } from '@/types';

interface ProfileContextProps {
  onSubmit: (emailContext: EmailContext | null) => void;
}

export function ProfileContext({ onSubmit }: ProfileContextProps) {
  const [uniqueValueProp, setUniqueValueProp] = useState('');
  const [pastSponsors, setPastSponsors] = useState('');
  const [audienceDemographics, setAudienceDemographics] = useState('');
  const [notableGuests, setNotableGuests] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const context: EmailContext = {
      unique_value_prop: uniqueValueProp || null,
      past_sponsors: pastSponsors || null,
      audience_demographics: audienceDemographics || null,
      notable_guests: notableGuests || null,
      additional_notes: additionalNotes || null,
    };
    onSubmit(context);
  };

  const handleSkip = () => {
    onSubmit(null);
  };

  const labelClasses = 'block text-sm font-medium mb-2';
  const inputClasses =
    'w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors resize-none';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[var(--primary)]/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Help us find better matches</h2>
          <p className="text-gray-400">
            Add a few details about your podcast to improve your sponsor matches. You can always skip this.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClasses}>What makes your podcast unique?</label>
            <textarea
              value={uniqueValueProp}
              onChange={(e) => setUniqueValueProp(e.target.value)}
              className={inputClasses}
              rows={2}
              placeholder="e.g. Only podcast interviewing Fortune 500 CTOs weekly, 95% completion rate"
            />
          </div>
          <div>
            <label className={labelClasses}>Past or current sponsors</label>
            <textarea
              value={pastSponsors}
              onChange={(e) => setPastSponsors(e.target.value)}
              className={inputClasses}
              rows={2}
              placeholder="e.g. Previously sponsored by Stripe, AWS, and Linear"
            />
          </div>
          <div>
            <label className={labelClasses}>Audience demographics</label>
            <textarea
              value={audienceDemographics}
              onChange={(e) => setAudienceDemographics(e.target.value)}
              className={inputClasses}
              rows={2}
              placeholder="e.g. 70% male, 25-44, $120k+ HHI, 60% US-based"
            />
          </div>
          <div>
            <label className={labelClasses}>Notable guests or achievements</label>
            <textarea
              value={notableGuests}
              onChange={(e) => setNotableGuests(e.target.value)}
              className={inputClasses}
              rows={2}
              placeholder="e.g. Featured guests include Y Combinator partners, Top 50 in Tech on Apple Podcasts"
            />
          </div>
          <div>
            <label className={labelClasses}>Anything else sponsors should know</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className={inputClasses}
              rows={2}
              placeholder="e.g. Open to custom integrations, live reads, host-read only"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            See My Matches
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors py-2"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
