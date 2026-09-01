import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { DEMO, demoArticles, demoArticleDetails, getDemoBalance } from '@/lib/demo';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput, incrementViewCount } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireUser();
  const slug = ctx.params?.slug;
  if (!slug) throw apiError('Slug required', 400, 'VALIDATION_ERROR');

  // ---- DEMO mode: read/write from in-memory demo store ----
  if (DEMO) {
    const a: any = demoArticles.find((x) => x.slug === slug);
    if (!a) throw apiError('Article not found', 404, 'NOT_FOUND');
    if (a.isFree) {
      return ok({ success: true, alreadyFree: true, content: demoArticleDetails[slug]?.content });
    }
    if (await isArticleUnlocked(u.id, a.id)) {
      return ok({
        success: true,
        alreadyUnlocked: true,
        content: demoArticleDetails[slug]?.content,
        newBalance: getDemoBalance(u.id),
      });
    }
    await deductPoints(u.id, a.pointCost, 'unlock', a.id);
    await recordUnlock(u.id, a.id, a.pointCost);
    const newBalance = getDemoBalance(u.id);
    return ok({
      success: true,
      pointsDeducted: a.pointCost,
      newBalance,
      content: demoArticleDetails[slug]?.content,
    });
  }

  const { rows } = await db.query<{
    id: string; point_cost: number; is_free: boolean; status: string; content: string | null;
  }>(
    `SELECT id, point_cost, is_free, status, content
     FROM articles
     WHERE slug = ? AND status = 'published'`,
    [slug]
  );

  if (!rows[0]) throw apiError('Article not found', 404, 'NOT_FOUND');
  const art = rows[0];

  if (art.is_free) {
    return ok({ success: true, alreadyFree: true });
  }

  if (await isArticleUnlocked(u.id, art.id)) {
    const full = await getArticleBySlug(slug, u.id);
    return ok({ success: true, alreadyUnlocked: true, content: full?.content });
  }

  await deductPoints(u.id, art.point_cost, 'unlock', art.id);
  await recordUnlock(u.id, art.id, art.point_cost);

  const { getUserPoints } = await import('@/lib/repo');
  const newBalance = await getUserPoints(u.id);

  return ok({
    success: true,
    pointsDeducted: art.point_cost,
    newBalance,
    content: art.content,
  });
});
