import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';
import { DEMO, DEMO_BALANCE, demoUser } from '@/lib/demo';

const lockoutMap = new Map<string, { count: number; until: Date }>();
const MAX_FAILS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const b = await req.json().catch(() => ({}));
  const { email, password } = b as { email: string; password: string };

  if (!email || !password) {
    throw apiError('Email and password required', 400, 'VALIDATION_ERROR');
  }

  const lockout = lockoutMap.get(email);
  if (lockout && lockout.count >= MAX_FAILS && new Date() < lockout.until) {
    throw apiError('Account temporarily locked. Try again later.', 423, 'ACCOUNT_LOCKED');
  }

  // Demo mode: no DB — accept any email/password pair and return the demo user.
  // Real registration has already been captured separately in demo mode.
  if (DEMO) {
    const demoEmail = (email || 'demo@chinadeeptravel.com').toLowerCase();
    // Reserved demo admin: any login to this address becomes the admin role.
    const isAdmin = demoEmail === 'demo@chinadeeptravel.com' || demoEmail === 'admin@chinadeeptravel.com';
    const role: 'user' | 'admin' = isAdmin ? 'admin' : 'user';
    const demoName = demoEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const token = signToken({ userId: 'demo-' + demoEmail, role, email: demoEmail });
    setSessionCookie(token);
    return ok({
      user: {
        id: 'demo-' + demoEmail,
        name: demoName,
        email: demoEmail,
        currentPoints: DEMO_BALANCE,
        emailVerified: false,
        role,
      },
      token,
      demo: true,
    });
  }

  const { rows } = await db.query<{
    id: string; name: string; email: string;
    password_hash: string; current_points: number; email_verified: boolean;
    is_suspended: boolean;
    role: string;
  }>('SELECT * FROM users WHERE email = ?', [email]);

  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    const current = lockoutMap.get(email);
    lockoutMap.set(email, {
      count: current ? current.count + 1 : 1,
      until: new Date(Date.now() + LOCKOUT_DURATION_MS),
    });
    throw apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.is_suspended) {
    throw apiError('Account suspended', 403, 'ACCOUNT_SUSPENDED');
  }

  lockoutMap.delete(email);

  const token = signToken({ userId: user.id, role: (user.role ?? 'user') as 'user' | 'admin', email: user.email });
  setSessionCookie(token);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currentPoints: user.current_points,
      emailVerified: user.email_verified,
      role: user.role ?? 'user',
    },
    token,
  });
});
