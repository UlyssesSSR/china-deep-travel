/**
 * PayPal Order 创建
 * 用户点击充值 → 创建 PayPal Order → 前端调用 PayPal SDK → capture 后 webhook 发积分
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function paypalAuth(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  return data.access_token;
}

export const POST = withHandler(async (req: NextRequest) => {
  const user = await requireUser();
  const { packageId, returnUrl, cancelUrl } = await req.json().catch(() => ({}));

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
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 'paypal', NOW())`,
    [orderId, orderNumber, user.id, pkg.id, pkg.price_usd, totalPoints]
  );

  // 创建 PayPal Order
  const accessToken = await paypalAuth();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        description: `${pkg.name} - ${totalPoints} CPT Points`,
        amount: {
          currency_code: 'USD',
          value: pkg.price_usd.toFixed(2),
        },
      }],
      application_context: {
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/account?paypal=success`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      },
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw apiError(data.error_description || 'PayPal error', 500, 'PAYPAL_ERROR');
  }

  // 记录 paypal_order_id
  await db.query(
    'UPDATE orders SET paypal_order_id = ? WHERE id = ?',
    [data.id, orderId]
  );

  const approveLink = data.links?.find((l: any) => l.rel === 'approve')?.href;

  return ok({
    paypalOrderId: data.id,
    approveUrl: approveLink,
    orderId,
  });
});
