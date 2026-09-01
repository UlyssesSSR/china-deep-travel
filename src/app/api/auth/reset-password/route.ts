import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const b = await req.json().catch(() => ({}));
  const parsed = resetSchema.safeParse(b);
  if (!parsed.success) {
    throw apiError('Token and password required', 400, 'VALIDATION_ERROR');
  }

  const { token, password } = parsed.data;

  const { rows } = await db.query<{ id: string; user_id: string; used: boolean; expires_at: Date }>(
    `SELECT * FROM password_reset_tokens
     WHERE token = ? AND used = 0 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [token]
  );

  if (!rows[0]) {
    throw apiError('Invalid or expired token', 400, 'INVALID_TOKEN');
  }

  const record = rows[0];
  const passwordHash = await hashPassword(password);
  await db.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [passwordHash, record.user_id]);
  await db.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [record.id]);

  return ok({ message: 'Password updated' });
});
