'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NavBar } from '@/components/NavBar';
import { ProfileForm } from '@/components/ProfileForm';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<null | { user: unknown; submission: unknown }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          setProfileData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <main className="pt-24 px-6">
          <div className="max-w-2xl mx-auto text-center text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <NavBar />
        <main className="pt-24 px-6">
          <div className="max-w-2xl mx-auto text-center text-gray-400">
            Please sign in to view your profile.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {profileData && <ProfileForm data={profileData as any} />}
        </div>
      </main>
    </div>
  );
}
