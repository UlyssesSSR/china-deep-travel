import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError } from './auth';

/**
 * Standard JSON success response.
 */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Standard JSON error response. Normalizes Zod, ApiError, and unknown errors.
 */
export function errorResponse(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.flatten()
        }
      },
      { status: 400 }
    );
  }

  if ((err as ApiError).status) {
    const e = err as ApiError;
    return NextResponse.json(
      {
        error: {
          code: e.code || 'BAD_REQUEST',
          message: e.message,
          details: e.details
        }
      },
      { status: e.status || 400 }
    );
  }

  console.error('[api] unhandled error:', err);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our end. Please try again.'
      }
    },
    { status: 500 }
  );
}

/** Wraps a route handler so thrown errors are converted to JSON responses. */
export function withHandler<T extends any[]>(
  fn: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

/** Pagination helper. */
export function paginate(page?: string | null, limit?: string | null, max = 24) {
  const p = Math.max(1, parseInt(page || '1', 10) || 1);
  const l = Math.min(max, Math.max(1, parseInt(limit || '12', 10) || 12));
  return { page: p, limit: l, offset: (p - 1) * l };
}
