'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface CreateAccountProps {
  email: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export function CreateAccount({ email, onSuccess, onSkip }: CreateAccountProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getSubmissionId = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('wildcast_submission_id');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const submissionId = getSubmissionId();

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, submissionId }),
      });

      const data = await res.json() as Record<string, any>;

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in. Please try signing in later.');
        setIsLoading(false);
      } else {
        onSuccess();
      }
    } catch {
      setError('Something went wrong');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: window.location.href });
    } catch {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[var(--primary)]/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Save your progress</h2>
          <p className="text-gray-400">
            Create a password to save your matches and come back anytime.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--card)] transition-colors disabled:opacity-50 mb-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="font-medium">Continue with Google</span>
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[var(--background)] text-gray-400">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Create a password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name || !password}
            className="w-full py-4 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors py-2"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
