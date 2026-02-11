'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Modal } from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'choose' | 'signup' | 'signin'>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getSubmissionId = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('wildcast_submission_id');
    }
    return null;
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    setError('');

    try {
      const submissionId = getSubmissionId();

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, submissionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Sign in with the new credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in. Please try signing in.');
        setIsLoading(false);
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError('Something went wrong');
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError('Something went wrong');
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setMode('choose');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const title = mode === 'signin' ? 'Sign in' : 'Create your account';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {mode === 'choose' ? (
          <>
            <p className="text-gray-400 text-center">
              Sign up to continue sending sponsor outreach and track your progress.
            </p>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-colors disabled:opacity-50"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--card)] text-gray-400">or</span>
              </div>
            </div>

            {/* Manual Sign Up Option */}
            <button
              onClick={() => setMode('signup')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Sign up with Email</span>
            </button>

            <p className="text-xs text-gray-500 text-center">
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-[var(--primary)] hover:underline">
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Your password'}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors"
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                />
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password || (mode === 'signup' && !name)}
                className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signup' ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setError(''); }} className="text-[var(--primary)] hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} className="text-[var(--primary)] hover:underline">
                    Sign up
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
