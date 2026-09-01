'use client';

import { useState } from 'react';

interface UserActionsProps {
  userId: string;
  currentPoints: number;
  isSuspended: boolean;
}

export default function UserActions({ userId, currentPoints, isSuspended }: UserActionsProps) {
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [pointsDelta, setPointsDelta] = useState('0');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdjustPoints = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pointsDelta: parseInt(pointsDelta),
          reason: reason || 'Admin adjustment',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to adjust points');
      }

      setShowPointsModal(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust points');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isSuspended: !isSuspended }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update status');
      }

      setShowSuspendConfirm(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setShowPointsModal(true)}
          className="px-3 py-1.5 text-sm border border-[#F1C40F] text-[#F1C40F] rounded hover:bg-[#F1C40F] hover:text-white transition-colors"
        >
          Adjust Points
        </button>
        <button
          onClick={() => setShowSuspendConfirm(true)}
          className={`px-3 py-1.5 text-sm border rounded transition-colors ${
            isSuspended
              ? 'border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white'
              : 'border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white'
          }`}
        >
          {isSuspended ? 'Reactivate' : 'Suspend'}
        </button>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-4">Adjust Points</h3>
            
            <p className="text-[#6B7280] mb-4">
              Current balance: <span className="font-semibold text-[#1A1A2E]">{currentPoints}</span> pts
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-[#E74C3C] rounded text-[#E74C3C] text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Points Delta (+ or -)
                </label>
                <input
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  placeholder="e.g., 100 or -50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  placeholder="e.g., Compensation for bug"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAdjustPoints}
                disabled={loading || !pointsDelta || parseInt(pointsDelta) === 0}
                className="px-4 py-2 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply'}
              </button>
              <button
                onClick={() => setShowPointsModal(false)}
                className="px-4 py-2 border border-[#E8E4DF] rounded-lg hover:bg-[#FAFAF8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirm Modal */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-4">
              {isSuspended ? 'Reactivate User?' : 'Suspend User?'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-[#E74C3C] rounded text-[#E74C3C] text-sm">
                {error}
              </div>
            )}

            <p className="text-[#6B7280] mb-6">
              {isSuspended
                ? 'This user will regain access to their account.'
                : 'This user will be blocked from logging in and accessing content.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSuspend}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  isSuspended
                    ? 'bg-[#27AE60] hover:bg-[#27AE60]/90'
                    : 'bg-[#E74C3C] hover:bg-[#E74C3C]/90'
                }`}
              >
                {loading ? 'Processing...' : isSuspended ? 'Reactivate' : 'Suspend'}
              </button>
              <button
                onClick={() => setShowSuspendConfirm(false)}
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
