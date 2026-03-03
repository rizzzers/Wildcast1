'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { PodcastInfo } from '@/types';
import { Modal } from './Modal';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (info: PodcastInfo, accountInfo?: { name: string; password: string }) => void;
}

export function UnlockModal({ isOpen, onClose, onUnlock }: UnlockModalProps) {
  const [email, setEmail] = useState('');
  const [podcastName, setPodcastName] = useState('');
  const [podcastUrl, setPodcastUrl] = useState('');
  const [description, setDescription] = useState('');
  const [hasMediaKit, setHasMediaKit] = useState(false);
  const [showAccountFields, setShowAccountFields] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = email && podcastName && podcastUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError('');

    const info: PodcastInfo = { email, podcastName, podcastUrl, description, hasMediaKit };
    const accountInfo = showAccountFields && name && password ? { name, password } : undefined;

    try {
      onUnlock(info, accountInfo);
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: window.location.href });
    } catch {
      setError('Failed to sign in with Google');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const inputClass = 'w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Unlock Your Matches" maxWidth="md">
      <div className="space-y-5">
        <p className="text-gray-400 text-sm">
          Enter your details to reveal contact names, emails, and LinkedIn profiles.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="unlock-email" className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="unlock-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="unlock-podcastName" className="block text-sm font-medium mb-2">
                Podcast Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="unlock-podcastName"
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                required
                className={inputClass}
                placeholder="The Daily Hustle"
              />
            </div>
            <div>
              <label htmlFor="unlock-podcastUrl" className="block text-sm font-medium mb-2">
                Podcast URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                id="unlock-podcastUrl"
                value={podcastUrl}
                onChange={(e) => setPodcastUrl(e.target.value)}
                required
                className={inputClass}
                placeholder="https://podcasts.apple.com/..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="unlock-description" className="block text-sm font-medium mb-2">
              Brief Description
            </label>
            <textarea
              id="unlock-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="What's your show about?"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="unlock-hasMediaKit"
              checked={hasMediaKit}
              onChange={(e) => setHasMediaKit(e.target.checked)}
              className="w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <label htmlFor="unlock-hasMediaKit" className="text-sm text-gray-300">
              I have a media kit ready for partners
            </label>
          </div>

          {/* Collapsible account creation section */}
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAccountFields(!showAccountFields)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-[var(--background)] transition-colors"
            >
              <span>Save your progress (optional)</span>
              <svg
                className={`w-4 h-4 transition-transform ${showAccountFields ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAccountFields && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
                <p className="text-xs text-gray-500 pt-3">Create a password to save your matches and come back anytime.</p>
                <div>
                  <label htmlFor="unlock-name" className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    id="unlock-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="unlock-password" className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    id="unlock-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 8 characters"
                    minLength={8}
                  />
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[var(--card)] text-gray-400">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium text-sm">Continue with Google</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Unlock My Matches'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          We&apos;ll never share your information. Unsubscribe anytime.
        </p>
      </div>
    </Modal>
  );
}
