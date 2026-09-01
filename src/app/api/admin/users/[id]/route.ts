import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';
import { awardPoints, deductPoints, getUserPoints } from '@/lib/repo';

export const PATCH = withHandler(async (req: NextRequest, ctx: { params: { id?: string } }) => {
  await requireAdmin();
  const id = ctx.params?.id;
  if (!id) throw apiError('User ID required', 400, 'VALIDATION_ERROR');

  const b = await req.json().catch(() => ({}));

  if (typeof b.pointsDelta === 'number') {
    if (!b.reason) throw apiError('reason required when adjusting points', 400, 'VALIDATION_ERROR');
    if (b.pointsDelta >= 0) {
      await awardPoints(id, b.pointsDelta, 'admin_adjustment', null, b.reason);
    } else {
      await deductPoints(id, Math.abs(b.pointsDelta), 'admin_adjustment', null, b.reason);
    }
    const balance = await getUserPoints(id);
    return ok({ newBalance: balance });
  }

  const sets: string[] = [];
  const vals: any[] = [];
  if (typeof b.is_suspended === 'boolean') {
    sets.push('is_suspended = ?');
    vals.push(b.is_suspended);
  }
  if (b.role) {
    sets.push('role = ?');
    vals.push(b.role);
  }

  if (sets.length) {
    vals.push(id);
    await db.query(
      `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
      vals
    );
  }

  const { rows } = await db.query(
    `SELECT id, name, email, role, current_points, email_verified, is_suspended
     FROM users WHERE id = ?`,
    [id]
  );

  return ok({ user: rows[0] });
});
