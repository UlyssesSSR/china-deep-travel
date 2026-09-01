'use client';

import { useState } from 'react';

interface OrderRefundButtonProps {
  orderId: string;
  orderNumber: string;
}

export default function OrderRefundButton({ orderId, orderNumber }: OrderRefundButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Refund failed');
      }

      setShowConfirm(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Refund failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-3 py-1.5 text-sm border border-[#E74C3C] text-[#E74C3C] rounded hover:bg-[#E74C3C] hover:text-white transition-colors"
      >
        Refund
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-4">Confirm Refund</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-[#E74C3C] rounded text-[#E74C3C] text-sm">
                {error}
              </div>
            )}

            <p className="text-[#6B7280] mb-2">
              Are you sure you want to refund this order?
            </p>
            <p className="text-[#1A1A2E] font-mono text-sm mb-6">
              Order #{orderNumber}
            </p>
            <p className="text-sm text-[#E74C3C] mb-6">
              This will revoke the awarded points from the user and initiate a refund via Stripe.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefund}
                disabled={loading}
                className="px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#E74C3C]/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Yes, Refund'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-[#E8E4DF] rounded-lg hover:bg-[#FAFAF8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
