'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function NavBar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg" />
          <span className="font-bold text-xl tracking-tight">Wildcast</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/survey"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Take the Survey
          </Link>

          {session?.user && (
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Profile
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

          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
