import { Resend } from 'resend';

/**
 * Email helper using Resend. In local/dev without a key, logs to console instead.
 */
let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || 'China Deep Travel <hello@chinadeeptravel.com>';

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log('[email] (no RESEND_API_KEY) would send to', to, '—', subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

export function verificationEmailLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/auth/verify-email?token=${token}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = verificationEmailLink(token);
  await sendEmail(
    email,
    'Verify your China Deep Travel account',
    `<p>Thanks for joining! Confirm your email to start unlocking guides:</p>
     <p><a href="${link}">${link}</a></p>
     <p>If you didn't sign up, you can ignore this email.</p>`
  );
}

export async function sendReceiptEmail(email: string, amountUSD: string, points: number) {
  await sendEmail(
    email,
    'Your points are on the way 🪙',
    `<p>Payment received: <strong>$${amountUSD}</strong></p>
     <p>We've added <strong>${points} CPT Points</strong> to your account.</p>
     <p>Start exploring: <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/guides">Browse guides</a></p>`
  );
}
