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
  const { email, name, googleId } = b as { email: string; name: string; googleId: string };

  if (!email) {
    throw apiError('Email required', 400, 'VALIDATION_ERROR');
  }

  const { rows: existing } = await db.query<{ id: string; name: string; email: string; current_points: number; email_verified: boolean }>(
    'SELECT id, name, email, current_points, email_verified FROM users WHERE email = ?',
    [email]
  );

  let user: { id: string; name: string; email: string; current_points: number; email_verified: boolean };

  if (existing.length === 0) {
    const newId = crypto.randomUUID();
    await db.query(
      `INSERT INTO users (id, name, email, google_id, role, current_points, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', 0, 1, NOW(), NOW())`,
      [newId, name || email.split('@')[0], email, googleId]
    );
    const { rows: inserted } = await db.query<{ id: string; name: string; email: string; current_points: number; email_verified: boolean }>(
      'SELECT id, name, email, current_points, email_verified FROM users WHERE id = ?',
      [newId]
    );
    user = inserted[0];

    const { rows: bonusRows } = await db.query<{ value: string }>(
      `SELECT value FROM site_settings WHERE \`key\` = ?`,
      ['welcome_bonus_points']
    );
    const welcomeBonus = bonusRows.length > 0 ? parseInt(bonusRows[0].value, 10) : 20;
    await awardPoints(user.id, welcomeBonus, 'signup_bonus', null);
    (user as any).current_points = welcomeBonus;
  } else {
    user = existing[0];
    if (googleId) {
      await db.query('UPDATE users SET google_id = ?, updated_at = NOW() WHERE id = ?', [googleId, user.id]);
    }
  }

  const token = signToken({ userId: user.id, role: 'user', email: user.email });
  setSessionCookie(token);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currentPoints: user.current_points,
      emailVerified: user.email_verified,
    },
  });
});
