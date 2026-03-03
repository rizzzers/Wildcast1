'use client';

import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavBar } from '@/components/NavBar';

function SubscribeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const isPro = (session?.user as any)?.plan === 'pro';

  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      router.push('/survey');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      <main className="pt-32 pb-16 px-6">
        {success && (
          <div className="max-w-xl mx-auto mb-10 px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            You&apos;re now on the Pro plan. Welcome to Howdi Pro!
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Unlock every partner match
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Get unlimited access to partner contacts tailored to your podcast.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <p className="text-sm text-gray-400 mb-6">Get started finding partners</p>
            <div className="text-3xl font-bold mb-6">
              $0<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Up to 3 matched partners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Contact names and companies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Basic outreach templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Profile and survey data</span>
              </li>
            </ul>
            <div className="px-6 py-3 rounded-xl border border-[var(--border)] text-center text-sm text-gray-400 font-medium">
              {!isPro ? 'Current Plan' : 'Free Plan'}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)] p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--primary)] rounded-full text-xs font-semibold">
              Most Popular
            </div>
            <h2 className="text-lg font-semibold mb-1">Pro</h2>
            <p className="text-sm text-gray-400 mb-6">Full access to grow your revenue</p>
            <div className="text-3xl font-bold mb-6">
              $99<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Unlimited partner matches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Direct emails, phone numbers, LinkedIn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>AI-powered outreach emails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Outreach tracking and history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                <span>Priority support</span>
              </li>
            </ul>

            {isPro ? (
              <button
                onClick={handlePortal}
                disabled={loading}
                className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Manage Subscription'}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : session ? 'Upgrade to Pro' : 'Get Started'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={null}>
      <SubscribeContent />
    </Suspense>
  );
}
