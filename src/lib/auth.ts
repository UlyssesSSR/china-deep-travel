import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { DEMO, demoUser } from './demo';
import type { SessionPayload, User, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const SESSION_COOKIE = 'cpt_session';

// ---- Password ----
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---- Token ----
export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// ---- Cookies / session ----
export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/** Returns the session payload from the request cookie, or null. */
export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Loads the full user record from DB using the session cookie.
 * Returns null if not authenticated or account is suspended.
 */
export async function getCurrentUser(): Promise<User | null> {
  // Demo mode: synthesize user from JWT. No session = visitor (demoUser).
  if (DEMO) {
    const session = getSession();
    if (!session) return demoUser;
    const email = session.email || 'demo@chinadeeptravel.com';
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      ...demoUser,
      id: session.userId,
      email,
      name,
      role: (session.role as 'user' | 'admin') ?? 'user',
    };
  }
  const session = getSession();
  if (!session) return null;
  const { rows } = await db.query<User>(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  );
  const user = rows[0];
  if (!user || user.is_suspended) return null;
  return user;
}

/** Throw-style guard for API routes that require a logged-in user. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('Unauthorized') as ApiError;
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return user;
}

/** Guard for admin-only routes. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') {
    const err = new Error('Forbidden') as ApiError;
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
  return user;
}

// ---- Custom error type ----
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export function apiError(message: string, status = 400, code = 'BAD_REQUEST', details?: any): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.code = code;
  err.details = details;
  return err;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
