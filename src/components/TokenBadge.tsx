'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TokenStatus {
  dailyLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  bonusTokens: number;
  canSpend: boolean;
  plan: string;
}

export function TokenBadge({ refreshKey }: { refreshKey?: number }) {
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setStatus(data as TokenStatus))
      .catch(() => {});
  }, [refreshKey]);

  const handleBuyTokens = async () => {
    setBuying(true);
    try {
      const res = await fetch('/api/stripe/buy-tokens', { method: 'POST' });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    } finally {
      setBuying(false);
    }
  };

  if (!status) return null;

  const dailyRemaining = Math.max(0, status.dailyLimit - status.tokensUsed);
  const isEmpty = status.tokensRemaining === 0;

  return (
    <div className="space-y-2">
      <div className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <svg className={`w-3.5 h-3.5 ${isEmpty ? 'text-red-400' : 'text-[var(--primary)]'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          <span className={`text-xs font-medium ${isEmpty ? 'text-red-400' : 'text-[var(--foreground)]'}`}>
            {dailyRemaining} / {status.dailyLimit} daily
            {status.bonusTokens > 0 && (
              <span className="text-[var(--primary)] ml-1">+{status.bonusTokens} bonus</span>
            )}
          </span>
        </div>
        {isEmpty && (
          <p className="text-xs text-gray-500 mt-0.5">Daily tokens reset at midnight UTC</p>
        )}
      </div>

      {status.plan === 'free' && (
        <div className="space-y-1.5">
          <Link
            href="/subscribe"
            className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-colors"
          >
            Upgrade to Pro — 50/day
          </Link>
          <button
            onClick={handleBuyTokens}
            disabled={buying}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
          >
            {buying ? 'Redirecting...' : 'Buy 25 Tokens · $49'}
          </button>
        </div>
      )}

      {status.plan === 'pro' && (
        <button
          onClick={handleBuyTokens}
          disabled={buying}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
        >
          {buying ? 'Redirecting...' : 'Buy 25 Tokens · $49'}
        </button>
      )}
    </div>
  );
}
