import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';
import { DEMO, demoPackages, addDemoOrder } from '@/lib/demo';
import { getPackages } from '@/lib/repo';
import { awardPoints } from '@/lib/points';

/**
 * MOCK top-up / recharge endpoint.
 *
 * This implements the FULL business logic of a purchase — it creates an order
 * and credits the user's points through the immutable ledger — but skips the
 * real payment provider. When Stripe/PayPal are wired in later, replace the
 * "MOCK" block below with `stripe.checkout.sessions.create(...)` and let the
 * webhook (`/api/webhooks/stripe`) mark the order completed + award points.
 * The ledger/award path stays identical, so the balance logic is unchanged.
 */
export const POST = withHandler(async (req: NextRequest, ctx: { params: { slug?: string; id?: string } }) => {
  const u = await requireUser();
  const b = await req.json().catch(() => ({}));

  let pkg: any = null;
  let amount: number;
  let points: number;

  if (b.packageId) {
    if (DEMO) {
      pkg = (demoPackages as any[]).find((p) => p.id === b.packageId);
      if (!pkg) throw apiError('Package not found', 404, 'NOT_FOUND');
    } else {
      const { rows } = await db.query('SELECT * FROM point_packages WHERE id = ? AND is_active = 1', [b.packageId]);
      if (!rows[0]) throw apiError('Package not found', 404, 'NOT_FOUND');
      pkg = rows[0];
    }
    amount = Number(DEMO ? pkg.priceUSD : pkg.price_usd);
    points = Number(pkg.pointsAmount ?? pkg.points_amount) + Number(DEMO ? (pkg.bonusPoints ?? 0) : (pkg.bonus_points || 0));
  } else {
    amount = Number(b.customAmountUSD);
    if (!(amount >= 5)) throw apiError('Minimum $5 required', 400, 'VALIDATION_ERROR');
    points = Number(b.customPointsAmount) || Math.round(amount * 30);
  }

  const orderId = crypto.randomUUID();
  const orderNo = 'CPT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

  if (DEMO) {
    addDemoOrder({
      id: orderId,
      orderNumber: orderNo,
      userId: u.id,
      userEmail: u.email,
      amountUsd: amount,
      pointsAwarded: points,
      status: 'completed',
      provider: 'mock',
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    const newBalance = await awardPoints(u.id, points, 'purchase', orderId);
    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/user/points?success=1&order=${orderId}`;
    return ok({
      success: true,
      mock: true,
      demo: true,
      pointsAwarded: points,
      newBalance,
      orderId,
      checkoutUrl: successUrl,
    });
  }

  // ---- MOCK payment: mark the order paid immediately ----
  await db.query(
    `INSERT INTO orders (id, order_number, user_id, package_id, amount_usd, points_awarded, status, provider, paid_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'completed', 'mock', NOW(), NOW())`,
    [orderId, orderNo, u.id, pkg?.id ?? null, amount, points]
  );

  // Credit points through the ledger (same path real payments will use).
  const newBalance = await awardPoints(u.id, points, 'purchase', orderId);

  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/user/points?success=1&order=${orderId}`;

  return ok({
    success: true,
    mock: true,
    pointsAwarded: points,
    newBalance,
    orderId,
    // The client should navigate here to show the success state.
    checkoutUrl: successUrl,
  });
});
