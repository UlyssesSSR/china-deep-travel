/**
 * Stripe Checkout Session 创建
 * 用户点击充值 → 创建 Stripe Checkout Session → 跳转支付 → webhooks 回调发积分
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';
import { getStripe } from '@/lib/stripe';

export const POST = withHandler(async (req: NextRequest) => {
  const user = await requireUser();
  const { packageId } = await req.json().catch(() => ({}));

  if (!packageId) {
    throw apiError('packageId required', 400, 'VALIDATION_ERROR');
  }

  // 查套餐
  const { rows: pkgs } = await db.query<{
    id: string; name: string; price_usd: number; points: number; bonus_points: number;
  }>('SELECT * FROM point_packages WHERE id = ?', [packageId]);

  const pkg = pkgs[0];
  if (!pkg) {
    throw apiError('Package not found', 404, 'NOT_FOUND');
  }

  // 创建订单
  const orderId = crypto.randomUUID();
  const totalPoints = pkg.points + (pkg.bonus_points || 0);
  const orderNumber = `CPT-${Date.now().toString(36).toUpperCase()}`;

  await db.query(
    `INSERT INTO orders (id, order_number, user_id, package_id, amount_usd, points_awarded, status, provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 'stripe', NOW())`,
    [orderId, orderNumber, user.id, pkg.id, pkg.price_usd, totalPoints]
  );

  // 创建 Stripe Checkout Session
  const stripe = getStripe();
  if (!stripe) throw apiError('Stripe is not configured', 503, 'NOT_CONFIGURED');
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${pkg.name} - ${totalPoints} CPT Points`,
          description: pkg.bonus_points > 0
            ? `Includes ${pkg.bonus_points} bonus points`
            : undefined,
        },
        unit_amount: Math.round(pkg.price_usd * 100), // cents
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    client_reference_id: user.id,
    metadata: {
      orderId,
      userId: user.id,
      pointsAwarded: totalPoints.toString(),
    },
  });

  // 记录 checkout_session_id（可选，便于对账）
  await db.query(
    'UPDATE orders SET stripe_checkout_session_id = ? WHERE id = ?',
    [session.id, orderId]
  );

  return ok({
    checkoutUrl: session.url,
    sessionId: session.id,
    orderId,
  });
});
