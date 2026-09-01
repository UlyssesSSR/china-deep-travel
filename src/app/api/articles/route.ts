import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category') ?? undefined;
  const cost = sp.get('cost');
  const sort = sp.get('sort') || 'newest';
  const { page, limit, offset } = paginate(sp.get('page'), sp.get('limit'));

  const costFilter = cost === 'free' || cost === 'paid' ? cost : 'all';
  const { articles, total } = await getPublishedArticles({
    category,
    cost: costFilter as 'free' | 'paid' | 'all',
    sort: sort as 'newest' | 'popular' | 'oldest',
    page,
    limit,
    offset,
  });

  const cats = await getCategories();

  return ok({
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    categories: cats.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: (c as any).article_count ?? 0,
    })),
  });
});
