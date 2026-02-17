'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NavBar } from '@/components/NavBar';

type Tab = 'overview' | 'users' | 'submissions' | 'outreach' | 'contacts';

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

interface ContactTally {
  contact_email: string;
  contact_name: string;
  brand_name: string;
  contact_role: string | null;
  email_count: number;
  last_sent_at: string;
}

interface OutreachDetail {
  id: string;
  contact_email: string;
  contact_name: string;
  brand_name: string;
  contact_role: string | null;
  template_used: string | null;
  email_subject: string | null;
  email_content: string | null;
  sent_at: string;
  user_name: string | null;
  user_email: string | null;
}

interface AdminContact {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  company: string;
  email: string | null;
  phone: string | null;
  description: string | null;
  industries: string | null;
  linkedin: string | null;
  website: string | null;
  tags: string | null;
  region: string | null;
  city: string | null;
  state: string | null;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  assigned_user_email: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contactTallies, setContactTallies] = useState<ContactTally[]>([]);
  const [outreachDetails, setOutreachDetails] = useState<OutreachDetail[]>([]);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [allContacts, setAllContacts] = useState<AdminContact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContactDetail, setExpandedContactDetail] = useState<string | null>(null);
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

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      setAllContacts(data);
    } catch (e) {
      console.error('Failed to fetch contacts:', e);
    }
  };

  const handleAssignContact = async (contactId: string, userId: string | null) => {
    try {
      await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, assignedUserId: userId }),
      });
      // Update local state
      setAllContacts((prev) =>
        prev.map((c) => {
          if (c.id !== contactId) return c;
          const assignedUser = userId ? users.find((u) => u.id === userId) : null;
          return {
            ...c,
            assigned_user_id: userId,
            assigned_user_name: assignedUser?.name || null,
            assigned_user_email: assignedUser?.email || null,
          };
        })
      );
    } catch (e) {
      console.error('Failed to assign contact:', e);
    }
  };

  const fetchOutreach = async () => {
    try {
      const res = await fetch('/api/admin/outreach');
      const data = await res.json();
      setContactTallies(data.contactTallies || []);
      setOutreachDetails(data.outreachDetails || []);
    } catch (e) {
      console.error('Failed to fetch outreach:', e);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab === 'users' && users.length === 0) fetchUsers();
    if (newTab === 'submissions' && submissions.length === 0) fetchSubmissions();
    if (newTab === 'outreach' && contactTallies.length === 0) fetchOutreach();
    if (newTab === 'contacts') {
      if (allContacts.length === 0) fetchContacts();
      if (users.length === 0) fetchUsers(); // need users for assignment dropdown
    }
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
            <button onClick={() => handleTabChange('outreach')} className={tabClasses('outreach')}>
              Outreach
            </button>
            <button onClick={() => handleTabChange('contacts')} className={tabClasses('contacts')}>
              Contacts
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
                            <td className="p-4 text-sm">{s.podcast_name || '-'}</td>
                            <td className="p-4 text-sm text-gray-400">{s.email || '-'}</td>
                            <td className="p-4 text-sm capitalize hidden md:table-cell">{s.category?.replace('-', ' ') || '-'}</td>
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
                          <td className="p-4 text-sm font-medium">{s.podcast_name || '-'}</td>
                          <td className="p-4 text-sm text-gray-400">{s.email || '-'}</td>
                          <td className="p-4 text-sm capitalize hidden md:table-cell">{s.category?.replace('-', ' ') || '-'}</td>
                          <td className="p-4 text-sm hidden md:table-cell">{s.audience_size?.replace('-', ' ') || '-'}</td>
                          <td className="p-4 text-sm capitalize hidden lg:table-cell">{s.primary_goal?.replace('-', ' ') || '-'}</td>
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

          {/* Contacts Tab */}
          {tab === 'contacts' && (() => {
            const filtered = allContacts.filter((c) => {
              if (!contactSearch) return true;
              const q = contactSearch.toLowerCase();
              return (
                c.first_name.toLowerCase().includes(q) ||
                c.last_name.toLowerCase().includes(q) ||
                c.company.toLowerCase().includes(q) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.industries && c.industries.toLowerCase().includes(q)) ||
                (c.title && c.title.toLowerCase().includes(q))
              );
            });

            return (
              <div className="space-y-4 animate-fade-in">
                {/* Search + count */}
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contacts by name, company, email, industry..."
                    className="flex-1 px-4 py-2.5 text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                  />
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {filtered.length} of {allContacts.length} contacts
                  </span>
                </div>

                {/* Contact cards */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {allContacts.length === 0 ? 'No contacts in database' : 'No contacts match your search'}
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {filtered.map((contact) => {
                        const isExpanded = expandedContactDetail === contact.id;

                        return (
                          <div key={contact.id}>
                            {/* Contact summary row */}
                            <div className="flex items-center gap-4 p-4 hover:bg-[var(--card-hover)] transition-colors">
                              <button
                                onClick={() => setExpandedContactDetail(isExpanded ? null : contact.id)}
                                className="flex-1 flex items-center gap-4 text-left min-w-0"
                              >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-[var(--primary)]">
                                    {contact.first_name[0]}{contact.last_name[0]}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                      {contact.first_name} {contact.last_name}
                                    </span>
                                    {contact.linkedin && (
                                      <a
                                        href={contact.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {contact.title && `${contact.title} · `}{contact.company}
                                  </div>
                                </div>
                                <div className="hidden md:block text-xs text-gray-500 truncate max-w-[200px]">
                                  {contact.industries}
                                </div>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {/* Assign dropdown */}
                              <div className="flex-shrink-0">
                                <select
                                  value={contact.assigned_user_id || ''}
                                  onChange={(e) => handleAssignContact(contact.id, e.target.value || null)}
                                  className="text-xs px-2 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-gray-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none min-w-[140px]"
                                >
                                  <option value="">Unassigned</option>
                                  {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name || u.email}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="bg-[var(--background)] border-t border-[var(--border)] px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Email</div>
                                    <div className="text-gray-300">
                                      {contact.email ? (
                                        <a href={`mailto:${contact.email}`} className="hover:text-[var(--primary)] transition-colors">
                                          {contact.email}
                                        </a>
                                      ) : '-'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                                    <div className="text-gray-300">{contact.phone || '-'}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Company</div>
                                    <div className="text-gray-300">{contact.company}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Title</div>
                                    <div className="text-gray-300">{contact.title || '-'}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Industries</div>
                                    <div className="text-gray-300">{contact.industries || '-'}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Location</div>
                                    <div className="text-gray-300">
                                      {[contact.city, contact.state, contact.region].filter(Boolean).join(', ') || '-'}
                                    </div>
                                  </div>
                                  {contact.website && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Website</div>
                                      <a
                                        href={contact.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--primary)] hover:underline text-sm"
                                      >
                                        {contact.website}
                                      </a>
                                    </div>
                                  )}
                                  {contact.linkedin && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">LinkedIn</div>
                                      <a
                                        href={contact.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline text-sm"
                                      >
                                        Profile
                                      </a>
                                    </div>
                                  )}
                                  {contact.tags && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Tags</div>
                                      <div className="text-gray-300">{contact.tags}</div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                                    <div className="text-gray-300">
                                      {contact.assigned_user_name || contact.assigned_user_email || (
                                        <span className="text-gray-500">Unassigned</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {contact.description && (
                                  <div className="mt-4">
                                    <div className="text-xs text-gray-500 mb-1">Description</div>
                                    <p className="text-sm text-gray-300">{contact.description}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Outreach Tab */}
          {tab === 'outreach' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary stat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Total Emails Sent</div>
                  <div className="text-3xl font-bold">{outreachDetails.length}</div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Unique Contacts</div>
                  <div className="text-3xl font-bold">{contactTallies.length}</div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-1">Unique Senders</div>
                  <div className="text-3xl font-bold">
                    {new Set(outreachDetails.map((o) => o.user_email).filter(Boolean)).size}
                  </div>
                </div>
              </div>

              {/* Contact tallies with expandable emails */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Emails by Contact</h2>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {contactTallies.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No outreach emails tracked yet</div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {contactTallies.map((contact) => {
                        const isExpanded = expandedContact === contact.contact_email;
                        const emails = outreachDetails.filter(
                          (o) => o.contact_email === contact.contact_email
                        );

                        return (
                          <div key={contact.contact_email}>
                            {/* Contact row */}
                            <button
                              onClick={() =>
                                setExpandedContact(isExpanded ? null : contact.contact_email)
                              }
                              className="w-full flex items-center justify-between p-4 hover:bg-[var(--card-hover)] transition-colors text-left"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                  <span className="text-sm font-bold text-[var(--primary)]">
                                    {contact.email_count}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {contact.contact_name}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {contact.brand_name}
                                    {contact.contact_role && ` · ${contact.contact_role}`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-xs text-gray-500 hidden sm:inline">
                                  {contact.contact_email}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Last: {new Date(contact.last_sent_at).toLocaleDateString()}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>

                            {/* Expanded email list */}
                            {isExpanded && (
                              <div className="bg-[var(--background)] border-t border-[var(--border)]">
                                {emails.map((email) => {
                                  const isEmailExpanded = expandedEmail === email.id;

                                  return (
                                    <div
                                      key={email.id}
                                      className="border-b border-[var(--border)] last:border-0"
                                    >
                                      <button
                                        onClick={() =>
                                          setExpandedEmail(isEmailExpanded ? null : email.id)
                                        }
                                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-[var(--card-hover)] transition-colors text-left"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <svg
                                            className="w-4 h-4 text-gray-500 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <div className="min-w-0">
                                            <span className="text-sm font-medium">
                                              {email.user_name || email.user_email || 'Unknown user'}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                              {email.template_used && `(${email.template_used})`}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className="text-xs text-gray-500">
                                            {new Date(email.sent_at).toLocaleString()}
                                          </span>
                                          {email.email_content && (
                                            <svg
                                              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                                isEmailExpanded ? 'rotate-180' : ''
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </button>

                                      {/* Email content */}
                                      {isEmailExpanded && email.email_content && (
                                        <div className="px-6 pb-4">
                                          {email.email_subject && (
                                            <div className="text-xs text-gray-400 mb-2">
                                              <span className="font-medium">Subject:</span>{' '}
                                              {email.email_subject}
                                            </div>
                                          )}
                                          <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 max-h-80 overflow-y-auto">
                                            {email.email_content}
                                          </pre>
                                        </div>
                                      )}
                                      {isEmailExpanded && !email.email_content && (
                                        <div className="px-6 pb-4 text-xs text-gray-500 italic">
                                          Email content not recorded (sent before tracking was added)
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
