import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  await requireAdmin();
  const b = await req.json().catch(() => ({}));

  if (!b.userId) throw apiError('userId required', 400, 'VALIDATION_ERROR');
  if (typeof b.pointsDelta !== 'number') throw apiError('pointsDelta required', 400, 'VALIDATION_ERROR');
  if (!b.reason) throw apiError('reason required', 400, 'VALIDATION_ERROR');

  if (b.pointsDelta >= 0) {
    await awardPoints(b.userId, b.pointsDelta, 'admin_adjustment', null, b.reason);
  } else {
    await deductPoints(b.userId, Math.abs(b.pointsDelta), 'admin_adjustment', null, b.reason);
  }

  const { getUserPoints } = await import('@/lib/repo');
  const newBalance = await getUserPoints(b.userId);

  return ok({ newBalance });
});
