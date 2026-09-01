'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Comment } from '@/lib/types';

interface Me {
  id: string;
  name: string;
  avatarUrl: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function initials(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, meRes] = await Promise.all([
        fetch(`/api/articles/${slug}/comments`, { cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' })
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      } else {
        setError('Could not load comments.');
      }
      if (meRes.ok) {
        const data = await meRes.json();
        const u = data?.user ?? data;
        if (u && typeof u === 'object' && u.id) {
          setMe({ id: u.id, name: u.name ?? 'Traveler', avatarUrl: u.avatarUrl ?? null });
        }
      }
    } catch {
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const post = useCallback(
    async (content: string, parentId: string | null, onDone: () => void) => {
      const text = content.trim();
      if (!text) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/articles/${slug}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, parentId })
        });
        if (res.status === 401) {
          window.location.href = `/auth/login?redirect=/guides/${encodeURIComponent(slug)}`;
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error?.message || 'Failed to post comment.');
          return;
        }
        onDone();
        setDraft('');
        setReplyDraft('');
        setReplyTo(null);
        setError(null);
        await load();
      } catch {
        setError('Failed to post comment.');
      } finally {
        setSubmitting(false);
      }
    },
    [slug, load]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!confirm('Delete this comment?')) return;
      try {
        const res = await fetch(`/api/articles/${slug}/comments/${id}`, { method: 'DELETE' });
        if (res.ok) await load();
      } catch {
        /* ignore */
      }
    },
    [slug, load]
  );

  const renderComment = (c: Comment, depth = 0) => (
    <div
      key={c.id}
      className={depth > 0 ? 'mt-4 pl-4 border-l border-border' : 'py-4 border-b border-border'}
    >
      <div className="flex items-start gap-3">
        {c.userAvatar ? (
          <img
            src={c.userAvatar}
            alt={c.userName}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
            {initials(c.userName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-secondary text-sm">{c.userName}</span>
            <span className="text-xs text-text-muted">{formatDate(c.createdAt)}</span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mt-1 whitespace-pre-wrap break-words">
            {c.content}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {me && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(replyTo === c.id ? null : c.id);
                  setReplyDraft('');
                }}
                className="text-xs text-primary hover:underline"
              >
                {replyTo === c.id ? 'Cancel' : 'Reply'}
              </button>
            )}
            {me && me.id === c.userId && (
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="text-xs text-text-muted hover:text-locked"
              >
                Delete
              </button>
            )}
          </div>
          {replyTo === c.id && me && (
            <div className="mt-3">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={`Reply to ${c.userName}…`}
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                disabled={submitting || !replyDraft.trim()}
                onClick={() => post(replyDraft, c.id, () => {})}
                className="mt-2 rounded-card bg-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post reply'}
              </button>
            </div>
          )}
        </div>
      </div>
      {c.replies && c.replies.length > 0 && (
        <div className="ml-4">
          {c.replies.map((r) => renderComment(r, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold text-secondary mb-1">Discussion</h2>
      <p className="text-sm text-text-muted mb-6">
        {total > 0 ? `${total} comment${total === 1 ? '' : 's'}` : 'No comments yet — be the first.'}
      </p>

      {error && (
        <p className="mb-4 rounded-card bg-locked/10 px-4 py-2 text-sm text-locked">{error}</p>
      )}

      {!me ? (
        <div className="rounded-card border border-border bg-surface px-5 py-4 text-sm text-text-secondary">
          <Link
            href={`/auth/login?redirect=/guides/${encodeURIComponent(slug)}`}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>{' '}
          to join the discussion.
        </div>
      ) : (
        <div className="rounded-card border border-border bg-surface px-5 py-4 mb-6">
          <div className="flex items-start gap-3">
            {me.avatarUrl ? (
              <img
                src={me.avatarUrl}
                alt={me.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold shrink-0">
                {initials(me.name)}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Share your experience or ask a question…"
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                disabled={submitting || !draft.trim()}
                onClick={() => post(draft, null, () => {})}
                className="mt-2 rounded-card bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-muted">
          No comments yet. {me ? 'Share what you learned!' : 'Sign in to start the conversation.'}
        </p>
      ) : (
        <div>{comments.map((c) => renderComment(c, 0))}</div>
      )}
    </section>
  );
}
