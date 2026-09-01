'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL. Please check your email for the correct verification link.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message ?? 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error?.message ?? 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <span className="text-2xl">🏔</span>
          <span className="font-display font-semibold text-secondary">China Deep Travel</span>
        </Link>

        <div className="bg-surface rounded-card border border-border shadow-lg p-8">
          {status === 'loading' || status === 'idle' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h1 className="font-display text-xl font-bold text-secondary mb-2">Verifying your email...</h1>
              <p className="text-sm text-text-secondary">Please wait a moment.</p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-xl font-bold text-secondary mb-2">Email Verified!</h1>
              <p className="text-sm text-text-secondary mb-6">{message}</p>
              <Link
                href="/user/dashboard"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-btn font-semibold text-sm hover:bg-primary-dark transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-display text-xl font-bold text-secondary mb-2">Verification Failed</h1>
              <p className="text-sm text-text-secondary mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-btn font-semibold text-sm hover:bg-primary-dark transition-colors"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Create a new account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
