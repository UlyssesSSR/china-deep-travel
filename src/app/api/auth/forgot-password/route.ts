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
  const { email } = b as { email: string };

  if (!email) {
    throw apiError('Email required', 400, 'VALIDATION_ERROR');
  }

  const { rows } = await db.query<{ id: string }>('SELECT id FROM users WHERE email = ?', [email]);

  if (rows.length > 0) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [rows[0].id, token, expires]
    );
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`;
    await sendEmail(
      email,
      'Reset Password',
      `<a href="${resetUrl}">Click here to reset your password: ${resetUrl}</a>`
    );
  }

  return ok({ message: 'If the email exists, a reset link was sent' });
});
