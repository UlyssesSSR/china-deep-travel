import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { DEMO, getDemoBalance, listDemoUnlocks, listDemoTxs } from '@/lib/demo';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const PATCH = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireUser();
  const b = await req.json().catch(() => ({}));

  if (DEMO) {
    return ok({
      user: {
        id: u.id,
        name: b.name ?? u.name,
        email: u.email,
        avatarUrl: b.avatarUrl ?? null,
        currentPoints: getDemoBalance(u.id),
        emailVerified: false,
        memberSince: new Date().toISOString(),
      },
      demo: true,
    });
  }

  await db.query(
    `UPDATE users
     SET name = COALESCE(?, name),
         avatar_url = COALESCE(?, avatar_url),
         updated_at = NOW()
     WHERE id = ?`,
    [b.name ?? null, b.avatarUrl ? b.avatarUrl : null, u.id]
  );

  const { rows } = await db.query<{
    id: string; name: string; email: string; avatar_url: string | null;
    current_points: number; email_verified: boolean; created_at: Date;
  }>(
    `SELECT id, name, email, avatar_url, current_points, email_verified, created_at
     FROM users WHERE id = ?`,
    [u.id]
  );

  if (!rows[0]) throw apiError('User not found', 404, 'NOT_FOUND');
  const user = rows[0];

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      currentPoints: user.current_points,
      emailVerified: user.email_verified,
      memberSince: user.created_at,
    },
  });
});
