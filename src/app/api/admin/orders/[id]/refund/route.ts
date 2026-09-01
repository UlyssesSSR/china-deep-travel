import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';
import { deductPoints } from '@/lib/repo';

export const PATCH = withHandler(async (req: NextRequest, ctx: { params: { id?: string } }) => {
  await requireAdmin();
  const id = ctx.params?.id;
  if (!id) throw apiError('Order ID required', 400, 'VALIDATION_ERROR');

  await db.query(`UPDATE orders SET status = 'refunded', refunded_at = NOW() WHERE id = ?`, [id]);

  try {
    const { rows: oRows } = await db.query<{ user_id: string; points_awarded: number }>(
      'SELECT user_id, points_awarded FROM orders WHERE id = ?',
      [id]
    );
    const o = oRows[0];
    if (o) {
      await deductPoints(o.user_id, o.points_awarded, 'refund', id, 'Admin refund');
    }
  } catch (_) {
    // points already deducted best-effort; status update is the source of truth
  }

  return ok({ refunded: true });
});
