import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { withHandler } from '@/lib/api';
import { getAdminOrders } from '@/lib/repo';

function csvCell(v: any): string {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const { orders } = await getAdminOrders({
    status: sp.get('status') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
    limit: 100000,
    offset: 0,
  });

  const header = [
    'Order #',
    'User Email',
    'Amount (USD)',
    'Points Awarded',
    'Status',
    'Provider',
    'Paid At',
    'Created At',
  ];
  const lines = [header.map(csvCell).join(',')];
  for (const o of orders) {
    lines.push(
      [
        o.order_number,
        o.user_email,
        o.amount_usd,
        o.points_awarded,
        o.status,
        o.provider,
        o.paid_at ? new Date(o.paid_at).toISOString() : '',
        o.created_at ? new Date(o.created_at).toISOString() : '',
      ]
        .map(csvCell)
        .join(',')
    );
  }

  // Prepend UTF-8 BOM so Excel renders non-ASCII characters correctly.
  const csv = '﻿' + lines.join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
});
