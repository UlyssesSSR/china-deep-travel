'use client';

import { useState } from 'react';

interface ArticleStatusToggleProps {
  articleId: string;
  currentStatus: string;
}

export default function ArticleStatusToggle({ articleId, currentStatus }: ArticleStatusToggleProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (newStatus: 'published' | 'archived') => {
    if (status === newStatus) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update status');
      }

      setStatus(newStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {status === 'published' ? (
        <button
          onClick={() => handleToggle('archived')}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-[#E74C3C] text-[#E74C3C] rounded hover:bg-[#E74C3C] hover:text-white transition-colors disabled:opacity-50"
        >
          Archive
        </button>
      ) : status === 'archived' ? (
        <button
          onClick={() => handleToggle('published')}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-[#27AE60] text-[#27AE60] rounded hover:bg-[#27AE60] hover:text-white transition-colors disabled:opacity-50"
        >
          Publish
        </button>
      ) : (
        <button
          onClick={() => handleToggle('published')}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-[#27AE60] text-[#27AE60] rounded hover:bg-[#27AE60] hover:text-white transition-colors disabled:opacity-50"
        >
          Publish
        </button>
      )}
    </div>
  );
}
