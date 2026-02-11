'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NavBar } from '@/components/NavBar';

type Tab = 'overview' | 'users' | 'submissions';

interface Stats {
  totalUsers: number;
  totalSubmissions: number;
  linkedSubmissions: number;
  recentSubmissions: Submission[];
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface Submission {
  id: string;
  user_id: string | null;
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
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, session]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions');
      const data = await res.json();
      setSubmissions(data);
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab === 'users' && users.length === 0) fetchUsers();
    if (newTab === 'submissions' && submissions.length === 0) fetchSubmissions();
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <main className="pt-24 px-6">
          <div className="max-w-6xl mx-auto text-center text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <main className="pt-24 px-6">
          <div className="max-w-6xl mx-auto text-center text-gray-400">
            Access denied. Admin privileges required.
          </div>
        </main>
      </div>
    );
  }

  const tabClasses = (t: Tab) =>
    `px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-[var(--primary)] text-white'
        : 'text-gray-400 hover:text-white hover:bg-[var(--card)]'
    }`;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button onClick={() => handleTabChange('overview')} className={tabClasses('overview')}>
              Overview
            </button>
            <button onClick={() => handleTabChange('users')} className={tabClasses('users')}>
              Users
            </button>
            <button onClick={() => handleTabChange('submissions')} className={tabClasses('submissions')}>
              Submissions
            </button>
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && stats && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Total Users</div>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Total Submissions</div>
                  <div className="text-3xl font-bold">{stats.totalSubmissions}</div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Linked to Users</div>
                  <div className="text-3xl font-bold">{stats.linkedSubmissions}</div>
                </div>
              </div>

              {/* Recent Submissions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left p-4 font-semibold text-sm">Podcast</th>
                          <th className="text-left p-4 font-semibold text-sm">Email</th>
                          <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">Category</th>
                          <th className="text-left p-4 font-semibold text-sm hidden lg:table-cell">User</th>
                          <th className="text-left p-4 font-semibold text-sm">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentSubmissions.map((s) => (
                          <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors">
                            <td className="p-4 text-sm">{s.podcast_name || '—'}</td>
                            <td className="p-4 text-sm text-gray-400">{s.email || '—'}</td>
                            <td className="p-4 text-sm capitalize hidden md:table-cell">{s.category?.replace('-', ' ') || '—'}</td>
                            <td className="p-4 text-sm hidden lg:table-cell">{s.user_name || <span className="text-gray-500">Anonymous</span>}</td>
                            <td className="p-4 text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {stats.recentSubmissions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No submissions yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="animate-fade-in">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left p-4 font-semibold text-sm">Name</th>
                        <th className="text-left p-4 font-semibold text-sm">Email</th>
                        <th className="text-left p-4 font-semibold text-sm">Role</th>
                        <th className="text-left p-4 font-semibold text-sm">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors">
                          <td className="p-4 text-sm font-medium">{u.name}</td>
                          <td className="p-4 text-sm text-gray-400">{u.email}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                : 'bg-[var(--card-hover)] text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">No users yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {tab === 'submissions' && (
            <div className="animate-fade-in">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left p-4 font-semibold text-sm">Podcast</th>
                        <th className="text-left p-4 font-semibold text-sm">Email</th>
                        <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">Category</th>
                        <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">Audience</th>
                        <th className="text-left p-4 font-semibold text-sm hidden lg:table-cell">Goal</th>
                        <th className="text-left p-4 font-semibold text-sm hidden lg:table-cell">User</th>
                        <th className="text-left p-4 font-semibold text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors">
                          <td className="p-4 text-sm font-medium">{s.podcast_name || '—'}</td>
                          <td className="p-4 text-sm text-gray-400">{s.email || '—'}</td>
                          <td className="p-4 text-sm capitalize hidden md:table-cell">{s.category?.replace('-', ' ') || '—'}</td>
                          <td className="p-4 text-sm hidden md:table-cell">{s.audience_size?.replace('-', ' ') || '—'}</td>
                          <td className="p-4 text-sm capitalize hidden lg:table-cell">{s.primary_goal?.replace('-', ' ') || '—'}</td>
                          <td className="p-4 text-sm hidden lg:table-cell">{s.user_name || <span className="text-gray-500">Anonymous</span>}</td>
                          <td className="p-4 text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {submissions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">No submissions yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
