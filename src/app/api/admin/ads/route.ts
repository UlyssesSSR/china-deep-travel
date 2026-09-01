import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, apiError } from '@/lib/auth';
import { ok, created, withHandler } from '@/lib/api';
import { getAdSlotsWithAds } from '@/lib/repo';

export const GET = withHandler(async () => {
  await requireAdmin();
  const slots = await getAdSlotsWithAds();
  return ok({ slots });
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  const b = await req.json().catch(() => ({}));
  if (!b.slotId || !b.title) {
    throw apiError('slotId and title required', 400, 'VALIDATION_ERROR');
  }

  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO advertisements
       (id, slot_id, title, image_url, target_url, is_active, start_date, end_date, priority, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      id,
      b.slotId,
      b.title,
      b.imageUrl ?? null,
      b.targetUrl ?? null,
      b.isActive ?? true,
      b.startDate ?? null,
      b.endDate ?? null,
      b.priority ?? 0,
    ]
  );

  const { rows } = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
  return created(rows[0]);
});
