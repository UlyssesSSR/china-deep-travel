import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { DEMO, demoArticles, demoCategories, listDemoUnlocks } from '@/lib/demo';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireUser();

  if (DEMO) {
    const unlocks = listDemoUnlocks(u.id).map((x) => {
      const a: any = demoArticles.find((aa) => aa.id === x.articleId) || {};
      const c: any = demoCategories.find((cc) => cc.id === a.categoryId) || {};
      return {
        articleId: x.articleId,
        title: a.title || 'Article',
        slug: a.slug || '',
        coverImageUrl: a.coverImage || null,
        categoryName: c.name || null,
        categorySlug: c.slug || null,
        unlockedAt: x.unlockedAt,
      };
    });
    return ok({ unlockedArticles: unlocks, total: unlocks.length });
  }

  const { rows } = await db.query<{
    article_id: string; title: string; slug: string;
    cover_image_url: string | null; name: string; cat_slug: string | null;
    unlocked_at: Date;
  }>(
    `SELECT ua.article_id, a.title, a.slug, a.cover_image_url,
            c.name, c.slug AS cat_slug, ua.unlocked_at
     FROM user_unlocked_articles ua
     JOIN articles a ON ua.article_id = a.id
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE ua.user_id = ?
     ORDER BY ua.unlocked_at DESC`,
    [u.id]
  );

  return ok({
    unlockedArticles: rows.map((r) => ({
      articleId: r.article_id,
      title: r.title,
      slug: r.slug,
      coverImageUrl: r.cover_image_url,
      categoryName: r.name,
      categorySlug: r.cat_slug,
      unlockedAt: r.unlocked_at,
    })),
    total: rows.length,
  });
});
