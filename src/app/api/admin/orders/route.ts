import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, withHandler, paginate } from '@/lib/api';
import { getAdminOrders } from '@/lib/repo';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const { page, limit, offset } = paginate(sp.get('page'), sp.get('limit'));

  const { orders, total } = await getAdminOrders({
    status: sp.get('status') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
    limit,
    offset,
  });

  return ok({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
