'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Registration failed. Please try again.');
      } else {
        window.dispatchEvent(new Event('auth:changed'));
        // Use replace + refresh to avoid DOM mismatch on SPA navigation
        // Next.js 14 dev mode StrictMode can cause removeChild errors with push+refresh
        router.replace('/user/dashboard');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-card border border-border shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-2xl">🏔</span>
              <span className="font-display font-semibold text-secondary">China Deep Travel</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-secondary mb-2">Create your account</h1>
            <p className="text-sm text-text-secondary">
              Join and get <span className="font-semibold text-accent">5 free points</span> to start exploring
            </p>
          </div>

          {/* Welcome bonus badge */}
          <div className="mb-6 flex items-center gap-3 bg-gold/10 border border-gold/30 rounded-card px-4 py-3">
            <span className="text-2xl">🪙</span>
            <div>
              <p className="text-sm font-semibold text-secondary">New member welcome bonus</p>
              <p className="text-xs text-text-muted">5 CPT Points — no purchase required</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-error/5 border border-error/20 rounded-btn text-sm text-error flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Alex Chen"
                className="w-full px-3.5 py-2.5 border border-border rounded-btn text-sm text-secondary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2.5 border border-border rounded-btn text-sm text-secondary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1.5">
                Password
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
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2.5 border border-border rounded-btn text-sm text-secondary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <p className="text-xs text-text-muted">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-btn font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary-dark font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
