import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';
import { DEMO, DEMO_BALANCE, getDemoBalance, listDemoUnlocks, listDemoTxs, listDemoOrders } from '@/lib/demo';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await getCurrentUser();
  if (!u) {
    throw apiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  // Demo mode: synthesize user object from JWT payload (no DB lookup)
  if (DEMO) {
    const email = u.email || 'demo@chinadeeptravel.com';
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const balance = getDemoBalance(u.id);
    const unlocks = listDemoUnlocks(u.id);
    const purchases = listDemoTxs(u.id, 'purchase');
    const totalPointsSpent = listDemoTxs(u.id, 'unlock')
      .reduce((s, t) => s + Math.abs(t.pointsDelta), 0);
    const totalSpentUSD = listDemoOrders()
      .filter((o) => o.userId === u.id && o.status === 'completed')
      .reduce((s, o) => s + (o.amountUsd || 0), 0);
    return ok({
      user: {
        id: u.id,
        name,
        email,
        avatarUrl: null,
        currentPoints: balance,
        emailVerified: false,
        role: u.role || 'user',
        memberSince: new Date().toISOString(),
        stats: {
          articlesUnlocked: unlocks.length,
          totalPointsSpent,
          totalSpentUSD,
        },
      },
      demo: true,
    });
  }

  const { rows: userRow } = await db.query<{
    id: string; name: string; email: string; avatar_url: string | null;
    current_points: number; email_verified: boolean; created_at: Date;
  }>('SELECT id, name, email, avatar_url, current_points, email_verified, created_at FROM users WHERE id = ?', [u.id]);
  if (!userRow[0]) throw apiError('User not found', 404, 'NOT_FOUND');

  const { rows: unlockedRows } = await db.query<{ count: number }>(
    'SELECT COUNT(*) AS count FROM user_unlocked_articles WHERE user_id = ?',
    [u.id]
  );
  const articlesUnlocked = parseInt(String(unlockedRows[0]?.count || '0'), 10);

  const { rows: spentRows } = await db.query<{ total: number | null }>(
    `SELECT COALESCE(SUM(ABS(points_delta)), 0) AS total
     FROM point_transactions
     WHERE user_id = ? AND type = 'unlock'`,
    [u.id]
  );
  const totalPointsSpent = parseInt(String(spentRows[0]?.total ?? '0'), 10);

  const { rows: orderRows } = await db.query<{ total: number | null }>(
    `SELECT COALESCE(SUM(amount_usd), 0) AS total
     FROM orders
     WHERE user_id = ? AND status = 'completed'`,
    [u.id]
  );
  const totalSpentUSD = parseFloat(String(orderRows[0]?.total ?? '0'));

  const user = userRow[0];
  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      currentPoints: user.current_points,
      emailVerified: user.email_verified,
      memberSince: user.created_at,
      stats: {
        articlesUnlocked,
        totalPointsSpent,
        totalSpentUSD,
      },
    },
  });
});
