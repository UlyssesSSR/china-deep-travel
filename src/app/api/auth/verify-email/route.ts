import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const b = await req.json().catch(() => ({}));
  const { token } = b as { token: string };

  if (!token) {
    throw apiError('Token required', 400, 'VALIDATION_ERROR');
  }

  const { rows } = await db.query<{ id: string; user_id: string; used: boolean; expires_at: Date }>(
    `SELECT * FROM email_verifications
     WHERE token = ? AND used = 0 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [token]
  );

  if (!rows[0]) {
    throw apiError('Invalid or expired token', 400, 'INVALID_TOKEN');
  }

  const record = rows[0];
  await db.query('UPDATE users SET email_verified = 1, updated_at = NOW() WHERE id = ?', [record.user_id]);
  await db.query('UPDATE email_verifications SET used = 1 WHERE id = ?', [record.id]);

  return ok({ verified: true });
});
