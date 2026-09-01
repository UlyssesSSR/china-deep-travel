import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const { page, limit, offset } = paginate(sp.get('page'), sp.get('limit'));

  const { articles, total } = await listArticlesAdmin({
    status: sp.get('status') ?? undefined,
    category: sp.get('category') ?? undefined,
    search: sp.get('search') ?? undefined,
    page,
    limit,
    offset,
  });

  return ok({
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireAdmin();
  const b = await req.json().catch(() => ({}));

  if (!b.title || !b.slug) {
    throw apiError('title and slug are required', 400, 'VALIDATION_ERROR');
  }

  const created2 = await createArticle(b as ArticleInput, u.id);
  return created(created2);
});
