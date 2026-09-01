import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, created, withHandler } from '@/lib/api';
import { requireUser, apiError } from '@/lib/auth';
import {
  getCommentsByArticleSlug,
  getArticleIdBySlug,
  getCommentById,
  addComment
} from '@/lib/repo';

export const GET = withHandler(
  async (_req: NextRequest, ctx: { params: { slug: string } }) => {
    const comments = await getCommentsByArticleSlug(ctx.params.slug);
    const total = comments.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);
    return ok({ comments, total });
  }
);

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment too long (max 2000 characters)'),
  parentId: z.string().uuid().nullable().optional()
});

export const POST = withHandler(
  async (req: NextRequest, ctx: { params: { slug: string } }) => {
    const user = await requireUser();
    const slug = ctx.params.slug;

    const body = await req.json().catch(() => ({}));
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      throw apiError(parsed.error.issues[0]?.message || 'Invalid comment', 400, 'VALIDATION_ERROR');
    }

    const articleId = await getArticleIdBySlug(slug);
    if (!articleId) throw apiError('Article not found', 404, 'NOT_FOUND');

    let parentId: string | null = parsed.data.parentId ?? null;
    if (parentId) {
      const parent = await getCommentById(parentId);
      if (!parent || parent.articleId !== articleId) parentId = null;
    }

    const comment = await addComment({
      articleId,
      userId: user.id,
      content: parsed.data.content,
      parentId
    });
    return created({ comment });
  }
);
