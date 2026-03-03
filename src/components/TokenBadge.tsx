'use client';

import { useEffect, useState } from 'react';

interface TokenStatus {
  dailyLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  canSpend: boolean;
  plan: string;
}

export function TokenBadge({ refreshKey }: { refreshKey?: number }) {
  const [status, setStatus] = useState<TokenStatus | null>(null);

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setStatus(data as TokenStatus))
      .catch(() => {});
  }, [refreshKey]);

  if (!status) return null;

  const isEmpty = status.tokensRemaining === 0;

  return (
    <div className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      <div className="flex items-center gap-1.5">
        <svg className={`w-3.5 h-3.5 ${isEmpty ? 'text-red-400' : 'text-[var(--primary)]'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
        <span className={`text-xs font-medium ${isEmpty ? 'text-red-400' : 'text-[var(--foreground)]'}`}>
          {status.tokensRemaining} / {status.dailyLimit} tokens
        </span>
      </div>
      {isEmpty && (
        <p className="text-xs text-gray-500 mt-0.5">Resets midnight UTC</p>
      )}
    </div>
  );
}
