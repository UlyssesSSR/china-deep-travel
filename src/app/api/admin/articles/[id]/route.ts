import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const PATCH = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  await requireAdmin();
  const id = ctx.params?.id;
  if (!id) throw apiError('Article ID required', 400, 'VALIDATION_ERROR');

  const b = await req.json().catch(() => ({}));
  const updated = await updateArticle(id, b);
  return ok(updated);
});

export const DELETE = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  await requireAdmin();
  const id = ctx.params?.id;
  if (!id) throw apiError('Article ID required', 400, 'VALIDATION_ERROR');

  await archiveArticle(id);
  return ok({ archived: true });
});
