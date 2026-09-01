'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      window.location.href = '/auth/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#E74C3C] hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <span className="text-xl">🚪</span>
      <span>{loading ? 'Signing out…' : 'Logout'}</span>
    </button>
  );
}
