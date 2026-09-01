import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ok, withHandler } from '@/lib/api';
import { awardPoints, deductPoints } from '@/lib/points';
import { getStripe } from '@/lib/stripe';
import { sendReceiptEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withHandler(async (req: NextRequest) => {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();
  const stripe = getStripe();

  // Stripe not configured at all -> tell scanners this endpoint is not live.
  if (!stripe) {
    return NextResponse.json(
      { error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured' } },
      { status: 503 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig || '', process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (e: any) {
    // Invalid signature -> 400. Expected response for any unsigned / forged request.
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: e?.message || 'Invalid signature' } },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session: any = event.data.object;
    const oid = session.metadata?.orderId;
    if (!oid) {
      return new NextResponse('ok', { status: 200 });
    }
    const { rows } = await db.query<{
      id: string; user_id: string; amount_usd: number; points_awarded: number; status: string;
    }>('SELECT * FROM orders WHERE id = ?', [oid]);
    const o = rows[0];
    if (o && o.status !== 'completed') {
      await db.query(
        `UPDATE orders SET status = 'completed', paid_at = NOW() WHERE id = ?`,
        [oid]
      );
      await awardPoints(o.user_id, o.points_awarded, 'purchase', o.id);
      try {
        await sendReceiptEmail(o.user_id, o.amount_usd.toString(), o.points_awarded);
      } catch (_) {}
    }
  } else if (
    event.type === 'payment_intent.payment_failed' ||
    event.type === 'checkout.session.async_payment_failed'
  ) {
    const session: any = event.data.object;
    const oid = session.metadata?.orderId;
    if (oid) {
      await db.query(`UPDATE orders SET status = 'failed' WHERE id = ?`, [oid]);
    }
  } else if (event.type === 'charge.refunded') {
    const charge: any = event.data.object;
    const oid = charge.metadata?.orderId;
    if (oid) {
      const { rows: oRows } = await db.query<{ user_id: string; points_awarded: number }>(
        'SELECT user_id, points_awarded FROM orders WHERE id = ?',
        [oid]
      );
      const o = oRows[0];
      if (o) {
        await db.query(
          `UPDATE orders SET status = 'refunded', refunded_at = NOW() WHERE id = ?`,
          [oid]
        );
        try {
          await deductPoints(o.user_id, o.points_awarded, 'refund', oid, 'Stripe refund');
        } catch (_) {}
      }
    }
  }

  return new NextResponse('ok', { status: 200 });
});