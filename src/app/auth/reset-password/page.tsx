'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('No reset token found. Please use the link from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('idle');
        setError(data.error?.message ?? 'Failed to reset password. The link may have expired.');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('idle');
      setError('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <span className="text-2xl">🏔</span>
            <span className="font-display font-semibold text-secondary">China Deep Travel</span>
          </Link>
          <div className="bg-surface rounded-card border border-border shadow-lg p-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-secondary mb-2">Password Reset!</h1>
            <p className="text-sm text-text-secondary mb-6">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-btn font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-card border border-border shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-2xl">🏔</span>
              <span className="font-display font-semibold text-secondary">China Deep Travel</span>
            </Link>
            <h1 className="font-display text-xl font-bold text-secondary mb-2">Reset Your Password</h1>
            <p className="text-sm text-text-secondary">Enter your new password below.</p>
          </div>

          {!token && (
            <div className="mb-5 p-3 bg-warning/10 border border-warning/20 rounded-btn text-sm text-warning">
              No reset token detected. Please use the link from your password reset email.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-error/5 border border-error/20 rounded-btn text-sm text-error flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1.5">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 border border-border rounded-btn text-sm text-secondary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-secondary mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your new password"
                className="w-full px-3.5 py-2.5 border border-border rounded-btn text-sm text-secondary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !token}
              className="w-full py-2.5 bg-primary text-white rounded-btn font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary-dark font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
