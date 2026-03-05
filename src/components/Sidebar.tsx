'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { TokenBadge } from './TokenBadge';

type NavItemId = 'overview' | 'outreach' | 'personalize' | 'settings' | 'sponsors'
  | 'shortlist'
  | 'admin' | 'admin-users' | 'admin-submissions' | 'admin-outreach' | 'admin-contacts';

interface SidebarProps {
  activeTab: NavItemId;
  user: { name?: string | null; email?: string | null; role?: string };
}

const navItems: { id: NavItemId; label: string; href: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'sponsors',
    label: 'Partners',
    href: '/sponsors',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'shortlist' as NavItemId,
    label: 'Shortlist',
    href: '/shortlist',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
      </svg>
    ),
  },
  {
    id: 'outreach',
    label: 'Outreach',
    href: '/profile?tab=outreach',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'personalize',
    label: 'Personalize',
    href: '/profile?tab=personalize',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/profile?tab=settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const adminItems: { id: NavItemId; label: string; href: string; icon: React.ReactNode }[] = [
  {
    id: 'admin',
    label: 'Overview',
    href: '/admin',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'admin-users',
    label: 'Users',
    href: '/admin?tab=users',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'admin-submissions',
    label: 'Submissions',
    href: '/admin?tab=submissions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'admin-outreach',
    label: 'Outreach',
    href: '/admin?tab=outreach',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'admin-contacts',
    label: 'Contacts',
    href: '/admin?tab=contacts',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export function Sidebar({ activeTab, user }: SidebarProps) {
  const initial = (user.name || user.email || 'U')[0].toUpperCase();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-[var(--card)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/howdi-logo-grey.png" alt="Howdi" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg tracking-tight">Howdi</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive
              ? 'bg-[var(--primary)] text-white'
              : 'text-gray-400 hover:text-white hover:bg-[var(--card-hover)]'
          }`;

          return (
            <Link key={item.id} href={item.href} scroll={false} className={className}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {user.role === 'admin' && (
          <>
            <div className="border-t border-[var(--border)] my-2" />
            <p className="text-xs text-gray-600 uppercase tracking-wider px-3 py-1">Admin</p>
            {adminItems.map((item) => {
              const isActive = activeTab === item.id;
              const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--card-hover)]'
              }`;
              return (
                <Link key={item.id} href={item.href} scroll={false} className={className}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[var(--border)] space-y-3">
        <TokenBadge />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-sm font-semibold text-[var(--primary)] shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
