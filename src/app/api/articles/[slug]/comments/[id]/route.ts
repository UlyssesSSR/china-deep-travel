import { NextRequest } from 'next/server';
import { ok, withHandler } from '@/lib/api';
import { requireUser, apiError } from '@/lib/auth';
import { getCommentById, deleteComment } from '@/lib/repo';

export const DELETE = withHandler(
  async (_req: NextRequest, ctx: { params: { slug: string; id: string } }) => {
    const user = await requireUser();
    const id = ctx.params.id;

    const comment = await getCommentById(id);
    if (!comment) throw apiError('Comment not found', 404, 'NOT_FOUND');

    if (comment.userId !== user.id && user.role !== 'admin') {
      throw apiError('You can only delete your own comments', 403, 'FORBIDDEN');
    }

    await deleteComment(id);
    return ok({ success: true });
  }
);
