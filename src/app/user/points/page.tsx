'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PointPackage } from '@/lib/types';

export default function UserPointsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check for success/cancel params
    if (searchParams.get('success') === '1') {
      setSuccess(true);
    }
    if (searchParams.get('canceled') === '1') {
      setError('Payment was canceled. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      const res = await fetch('/api/packages', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load packages');
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (err) {
      setError('Failed to load point packages. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(packageId: string) {
    setError(null);
    setPurchasing(packageId);
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ packageId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Checkout failed');
      }

      const data = await res.json();
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setPurchasing(null);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Buy Points</h1>
      <p className="text-[#6B7280] mb-8">
        Purchase CPT Points to unlock premium travel guides. 1 USD = 30 CPT Points
      </p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-[#27AE60] rounded-lg flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <p className="text-[#27AE60] font-medium">Points added to your account successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-[#E74C3C] rounded-lg flex items-center gap-3">
          <span className="text-2xl">⚠</span>
          <p className="text-[#E74C3C]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[#E74C3C] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#E8E4DF] animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/2" />
              <div className="h-12 bg-gray-200 rounded mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-xl p-6 border-2 shadow-sm transition-all hover:shadow-lg ${
                pkg.isPopular
                  ? 'border-[#C0392B] ring-2 ring-[#C0392B] ring-opacity-20'
                  : 'border-[#E8E4DF]'
              }`}
            >
              {pkg.isPopular && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C0392B] text-white text-xs font-semibold rounded-full">
                    ⭐ Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-lg font-semibold text-[#1A1A2E]">{pkg.name}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1A1A2E]">
                    🪙 {pkg.pointsAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[#6B7280] mt-1">CPT Points</p>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-[#1A1A2E]">
                  ${pkg.priceUSD}
                </p>
                {pkg.bonusPoints > 0 && (
                  <p className="text-sm text-[#27AE60] font-medium mt-1">
                    Includes {pkg.bonusPoints} bonus points!
                  </p>
                )}
                {pkg.badge && (
                  <p className="text-sm text-[#E67E22] font-medium mt-1">
                    {pkg.badge}
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing === pkg.id}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  pkg.isPopular
                    ? 'bg-[#C0392B] text-white hover:bg-[#922B21]'
                    : 'bg-[#1A1A2E] text-white hover:bg-black'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {purchasing === pkg.id ? 'Processing...' : pkg.isPopular ? 'Select — Popular' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-[#1A1A2E] rounded-xl p-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Exchange Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-90">1 USD</p>
          </div>
          <span className="text-2xl">=</span>
          <div className="flex-1 bg-[#F1C40F]/20 rounded-lg p-4">
            <p className="text-xl font-bold text-[#F1C40F]">30 CPT Points</p>
          </div>
        </div>
        <p className="mt-4 text-sm opacity-75">
          CPT Points are non-refundable and can only be used to unlock travel guides on China Deep Travel.
        </p>
      </div>
    </div>
  );
}
