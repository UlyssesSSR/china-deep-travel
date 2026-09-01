import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';

export const PATCH = withHandler(async (req: NextRequest, ctx: { params: { id?: string } }) => {
  await requireAdmin();
  const id = ctx.params?.id;
  if (!id) throw apiError('Ad ID required', 400, 'VALIDATION_ERROR');

  const b = await req.json().catch(() => ({}));

  const sets: string[] = [];
  const vals: any[] = [];
  if (typeof b.isActive === 'boolean') {
    sets.push('is_active = ?');
    vals.push(b.isActive);
  }
  if (b.imageUrl !== undefined) {
    sets.push('image_url = ?');
    vals.push(b.imageUrl);
  }
  if (b.targetUrl !== undefined) {
    sets.push('target_url = ?');
    vals.push(b.targetUrl);
  }
  if (b.startDate !== undefined) {
    sets.push('start_date = ?');
    vals.push(b.startDate);
  }
  if (b.endDate !== undefined) {
    sets.push('end_date = ?');
    vals.push(b.endDate);
  }
  if (typeof b.priority === 'number') {
    sets.push('priority = ?');
    vals.push(b.priority);
  }

  if (!sets.length) {
    throw apiError('No fields to update', 400, 'VALIDATION_ERROR');
  }

  vals.push(id);
  await db.query(`UPDATE advertisements SET ${sets.join(', ')} WHERE id = ?`, vals);

  const { rows } = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
  if (!rows[0]) throw apiError('Advertisement not found', 404, 'NOT_FOUND');
  return ok(rows[0]);
});
