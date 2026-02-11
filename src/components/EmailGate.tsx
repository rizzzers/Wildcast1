'use client';

import { useState } from 'react';
import { PodcastInfo } from '@/types';

interface EmailGateProps {
  onSubmit: (info: PodcastInfo) => void;
}

export function EmailGate({ onSubmit }: EmailGateProps) {
  const [formData, setFormData] = useState<PodcastInfo>({
    email: '',
    podcastName: '',
    podcastUrl: '',
    description: '',
    hasMediaKit: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Send email notification to ryan@ryanestes.info
    try {
      await fetch('/api/submit-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to submit:', error);
    }

    setIsSubmitting(false);
    onSubmit(formData);
  };

  const isValid = formData.email && formData.podcastName && formData.podcastUrl;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[var(--primary)]/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Almost there!</h2>
          <p className="text-gray-400">Tell us about your podcast to get your personalized matches.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="podcastName" className="block text-sm font-medium mb-2">
              Podcast Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="podcastName"
              name="podcastName"
              value={formData.podcastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
              placeholder="The Daily Hustle"
            />
          </div>

          <div>
            <label htmlFor="podcastUrl" className="block text-sm font-medium mb-2">
              Podcast URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              id="podcastUrl"
              name="podcastUrl"
              value={formData.podcastUrl}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
              placeholder="https://podcasts.apple.com/..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Brief Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors resize-none"
              placeholder="What's your show about? Who listens?"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasMediaKit"
              name="hasMediaKit"
              checked={formData.hasMediaKit}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <label htmlFor="hasMediaKit" className="text-sm text-gray-300">
              I have a media kit ready for sponsors
            </label>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? 'Submitting...' : 'Get My Matches'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          We&apos;ll never share your information. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
