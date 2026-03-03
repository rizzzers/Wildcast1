'use client';

interface LockedFieldProps {
  onUnlock: () => void;
  isUnlocking?: boolean;
  tokensRemaining: number;
  label?: string;
}

export function LockedField({ onUnlock, isUnlocking, tokensRemaining, label }: LockedFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-sm select-none blur-sm pointer-events-none text-gray-400 font-mono"
        aria-hidden="true"
      >
        {label === 'Phone' ? '●●●-●●●-●●●●' : label === 'LinkedIn' ? 'linkedin.com/in/●●●●●●' : '●●●●●@●●●●●.com'}
      </span>
      <button
        onClick={onUnlock}
        disabled={isUnlocking || tokensRemaining === 0}
        className="text-xs px-2 py-0.5 rounded-md bg-[var(--primary)]/20 border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/30 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
      >
        {isUnlocking ? 'Unlocking...' : tokensRemaining === 0 ? 'No tokens' : 'Unlock (1 token)'}
      </button>
    </div>
  );
}
