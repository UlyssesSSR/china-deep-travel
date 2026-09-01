import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';
import { DEMO, DEMO_BALANCE } from '@/lib/demo';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const b = await req.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(b);
  if (!parsed.success) {
    throw apiError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }

  const { name, email, password } = parsed.data;

  // Demo mode: no DB configured — register against in-memory mock user
  if (DEMO) {
    // Use a stable ID derived from the email so subsequent logins hit the
    // same in-memory balance / unlock store.
    const demoId = 'demo-' + email.toLowerCase();
    setSessionCookie(signToken({ userId: demoId, role: 'user', email }));
    return created({
      user: {
        id: demoId,
        name,
        email,
        currentPoints: DEMO_BALANCE,
        emailVerified: false,
        role: 'user',
      },
      welcomePointsAwarded: 0,
      demo: true,
    });
  }

  const { rows: exist } = await db.query<{ id: string }>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if (exist.length > 0) {
    throw apiError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const newId = crypto.randomUUID();
  await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, current_points, email_verified, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'user', 0, 0, NOW(), NOW())`,
    [newId, name, email, passwordHash]
  );
  const { rows: userRows } = await db.query<{ id: string; name: string; email: string; current_points: number; email_verified: boolean }>(
    'SELECT id, name, email, current_points, email_verified FROM users WHERE id = ?',
    [newId]
  );
  const user = userRows[0];

  const { rows: bonusRows } = await db.query<{ value: string }>(
    'SELECT value FROM site_settings WHERE `key` = ?',
    ['welcome_bonus_points']
  );
  const welcomeBonus = bonusRows.length > 0 ? parseInt(bonusRows[0].value, 10) : 20;

  await awardPoints(user.id, welcomeBonus, 'signup_bonus', null);

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO email_verifications (user_id, token, expires_at, used)
     VALUES (?, ?, ?, 0)`,
    [user.id, token, expires]
  );
  await sendVerificationEmail(email, token);

  setSessionCookie(signToken({ userId: user.id, role: 'user', email }));

  return created({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currentPoints: welcomeBonus,
      emailVerified: false,
    },
    welcomePointsAwarded: welcomeBonus,
  });
});
