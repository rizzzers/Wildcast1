'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { AuthModal } from './AuthModal';

export function NavBar() {
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  const isAuthenticated = !!session?.user;
  const isPro = session?.user?.plan === 'pro';

  // Sidebar handles navigation for authenticated users
  if (isAuthenticated) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/howdi-logo-grey.png" alt="Howdi" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight">Howdi</span>
          </Link>

          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/survey"
              className="hidden md:inline text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Take the Survey
            </Link>

            {isAuthenticated && (
              <Link
                href="/sponsors"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Partners
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Profile
              </Link>
            )}

            {isAuthenticated && !isPro && (
              <Link
                href="/subscribe"
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}

            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-medium px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
              >
                Create Account
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    </>
  );
}
