'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface UnlockButtonProps {
  slug: string;
  pointCost: number;
  canUnlock: boolean;
  currentPoints: number;
  isLoggedIn: boolean;
}

export function UnlockButton({
  slug,
  pointCost,
  canUnlock,
  currentPoints,
  isLoggedIn
}: UnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Not logged in — redirect to login
  if (!isLoggedIn) {
    return (
      <Button href={`/auth/login?redirect=/guides/${slug}`} size="lg">
        🔒 Login to Unlock — {pointCost} pts
      </Button>
    );
  }

  // Logged in but insufficient points
  if (!canUnlock) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button href="/user/points" size="lg">
          🪙 Buy Points — You have {currentPoints} pts
        </Button>
        <Button variant="outline" href="/user/points" size="lg">
          Get More Points →
        </Button>
      </div>
    );
  }

  // Can unlock — one-click unlock
  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}/unlock`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error?.message ?? 'Failed to unlock. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <Button onClick={handleUnlock} loading={loading} size="lg">
        🔓 Unlock for {pointCost} pts
      </Button>
      <Button variant="ghost" href="/user/points" size="lg">
        Buy Points →
      </Button>
    </div>
  );
}
