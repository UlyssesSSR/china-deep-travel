/**
 * PayPal Webhook - 支付成功后发积分
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { sendReceiptEmail } from '@/lib/email';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('paypal-transmission-sig');
  const certUrl = req.headers.get('paypal-cert-url');
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');

  // 1. 验证签名（生产必须，demo 可跳过）
  if (process.env.PAYPAL_MODE === 'live' && sig && certUrl) {
    const creds = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');
    const authRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const authData = await authRes.json();
    const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: 'SHA256withRSA',
        transmission_sig: sig,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(raw),
      }),
    });
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== 'SUCCESS') {
      console.error('[paypal webhook] signature verification failed');
      return new NextResponse('invalid signature', { status: 400 });
    }
  }

  const event = JSON.parse(raw);

  // 2. 处理支付完成
  if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
    const orderId = event.resource?.purchase_units?.[0]?.reference_id;
    const paypalOrderId = event.resource?.id;

    if (orderId) {
      // Capture the payment
      const creds = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');
      const authRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const authData = await authRes.json();

      await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } else if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id
      || event.resource?.purchase_units?.[0]?.reference_id;

    if (orderId) {
      const { rows: oRows } = await db.query<{
        id: string; user_id: string; status: string; points_awarded: number; amount_usd: number;
      }>('SELECT * FROM orders WHERE id = ?', [orderId]);

      const o = oRows[0];
      if (o && o.status !== 'completed') {
        await db.query(
          `UPDATE orders SET status = 'completed', paid_at = NOW() WHERE id = ?`,
          [orderId]
        );
        await awardPoints(o.user_id, o.points_awarded, 'purchase', o.id);
        try {
          await sendReceiptEmail(o.user_id, o.amount_usd.toString(), o.points_awarded);
        } catch (_) {}
      }
    }
  } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED' || event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      await db.query(
        `UPDATE orders SET status = 'failed' WHERE id = ?`,
        [orderId]
      );
    }
  }

  return new NextResponse('ok', { status: 200 });
}
