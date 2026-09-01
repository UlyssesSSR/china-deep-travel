'use client';

import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="max-w-container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-secondary mb-3">Something went wrong</h1>
      <p className="text-text-secondary mb-6">
        This page hit an unexpected error. A hard refresh (Ctrl+Shift+R) usually clears it.
        If it persists, try a private window.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-card bg-primary px-5 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded-card border border-border px-5 py-2 text-sm font-medium text-secondary hover:bg-surface">
          Back home
        </Link>
      </div>
    </section>
  );
}
