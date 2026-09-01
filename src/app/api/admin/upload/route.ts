import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin, apiError } from '@/lib/auth';
import { ok, withHandler } from '@/lib/api';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Image upload endpoint for admin (ad creatives + article covers).
 *
 * Persists to public/uploads by default and returns a local URL. When R2 is
 * configured (R2_ACCOUNT_ID + R2_BUCKET + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY)
 * you can swap the local write below for an @aws-sdk/client-s3 PutObject call and
 * return the R2 public URL instead — no other call site needs to change.
 */
export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) throw apiError('file required', 400, 'VALIDATION_ERROR');
  if (!ALLOWED.includes(file.type)) {
    throw apiError('unsupported image type (png/jpeg/webp/gif only)', 400, 'VALIDATION_ERROR');
  }
  if (file.size > MAX_BYTES) {
    throw apiError('file too large (max 5MB)', 400, 'VALIDATION_ERROR');
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const name = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  const url = `/uploads/${name}`;
  return ok({ url });
});

export const runtime = 'nodejs';
