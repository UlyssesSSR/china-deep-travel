import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput, incrementViewCount } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await getCurrentUser();
  const slug = ctx.params?.slug;
  if (!slug) throw apiError('Slug required', 400, 'VALIDATION_ERROR');

  const d = await getArticleBySlug(slug, u?.id);
  if (!d) throw apiError('Not found', 404, 'NOT_FOUND');

  await incrementViewCount(d.id);

  return ok(d);
});
