import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireUser, requireAdmin, signToken, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, apiError } from '@/lib/auth';
import { ok, created, withHandler, paginate } from '@/lib/api';
import { DEMO, listDemoTxs, demoArticles, listDemoOrders } from '@/lib/demo';
import { getCategories, getPublishedArticles, getArticleBySlug, getPackages, getActiveAds, getStats, listArticlesAdmin, createArticle, updateArticle, archiveArticle, listUsers, ArticleInput } from '@/lib/repo';
import { awardPoints, deductPoints, isArticleUnlocked, recordUnlock } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendVerificationEmail, sendReceiptEmail, sendEmail } from '@/lib/email';

export const GET = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireUser();
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type') ?? undefined;
  const from = sp.get('from') ?? undefined;
  const to = sp.get('to') ?? undefined;
  const { page, limit, offset } = paginate(sp.get('page'), sp.get('limit'));

  if (DEMO) {
    let txs = listDemoTxs(u.id, type);
    if (from) txs = txs.filter((t) => t.createdAt >= from);
    if (to) txs = txs.filter((t) => t.createdAt <= to);
    const total = txs.length;
    const slice = txs.slice(offset, offset + limit);
    const orders = listDemoOrders();
    const transactions = slice.map((t) => {
      let reference: any = { type: t.referenceType ?? 'unknown', id: t.referenceId ?? null };
      if (t.referenceType === 'article') {
        const a: any = demoArticles.find((aa) => aa.id === t.referenceId);
        if (a) reference = { type: 'article', id: t.referenceId, title: a.title };
      } else if (t.referenceType === 'order' || t.referenceType === 'purchase') {
        const o = orders.find((oo) => oo.id === t.referenceId);
        if (o) reference = { type: 'purchase', id: t.referenceId, amount: o.amountUsd };
      }
      return {
        id: t.id,
        type: t.type,
        pointsDelta: t.pointsDelta,
        balanceAfter: t.balanceAfter,
        reference,
        createdAt: t.createdAt,
      };
    });
    return ok({
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const conditions: string[] = ['pt.user_id = ?'];
  const values: any[] = [u.id];

  if (type) {
    conditions.push(`pt.type = ?`);
    values.push(type);
  }
  if (from) {
    conditions.push(`pt.created_at >= ?`);
    values.push(from);
  }
  if (to) {
    conditions.push(`pt.created_at <= ?`);
    values.push(to);
  }

  const where = 'WHERE ' + conditions.join(' AND ');

  const { rows: totalRows } = await db.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM point_transactions pt ${where}`,
    values
  );
  const total = parseInt(String(totalRows[0]?.count || '0'), 10);

  values.push(limit, offset);
  const { rows } = await db.query<{
    id: string; type: string; points_delta: number; balance_after: number;
    reference_type: string | null; reference_id: string | null;
    created_at: Date; article_title?: string; order_amount?: number;
  }>(
    `SELECT pt.*,
            a.title AS article_title,
            o.amount_usd AS order_amount
     FROM point_transactions pt
     LEFT JOIN articles a ON pt.reference_type = 'article' AND pt.reference_id = a.id
     LEFT JOIN orders o ON pt.reference_type = 'purchase' AND pt.reference_id = o.id
     ${where}
     ORDER BY pt.created_at DESC
     LIMIT ? OFFSET ?`,
    values
  );

  const transactions = rows.map((r) => ({
    id: r.id,
    type: r.type,
    pointsDelta: r.points_delta,
    balanceAfter: r.balance_after,
    reference: r.article_title
      ? { type: 'article', id: r.reference_id, title: r.article_title }
      : r.order_amount
        ? { type: 'purchase', id: r.reference_id, amount: r.order_amount }
        : { type: r.reference_type ?? 'unknown', id: r.reference_id ?? null },
    createdAt: r.created_at,
  }));

  return ok({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
