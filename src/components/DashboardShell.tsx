'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';

interface DashboardShellProps {
  children: React.ReactNode;
  activeTab?: 'overview' | 'outreach' | 'personalize' | 'settings' | 'sponsors'
    | 'shortlist'
    | 'admin' | 'admin-users' | 'admin-submissions' | 'admin-outreach' | 'admin-contacts';
}

export function DashboardShell({ children, activeTab = 'overview' }: DashboardShellProps) {
  const { data: session } = useSession();
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    fetch('/api/gmail/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) => setGmailConnected(d.connected))
      .catch(() => {});
  }, []);

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    role: session?.user?.role,
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        user={user}
        gmailConnected={gmailConnected}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
