import { db, withTransaction } from './db';
import { apiError } from './auth';
import {
  DEMO,
  DEMO_BALANCE,
  getDemoBalance,
  setDemoBalance,
  addDemoTx,
  addDemoUnlock,
  isDemoUnlocked,
} from './demo';
import { randomUUID } from 'crypto';

/**
 * Atomic point operations. Every write goes through `point_transactions`
 * (an immutable ledger) and `users.current_points` is updated in the SAME
 * transaction, so the balance can never drift from the ledger.
 *
 * - awardPoints: add points (purchase / signup bonus / admin / refund).
 * - deductPoints: subtract points with a `SELECT ... FOR UPDATE` row lock;
 *   throws a 402 INSUFFICIENT_POINTS when the balance is too low.
 */

export async function awardPoints(
  userId: string,
  points: number,
  type: 'purchase' | 'signup_bonus' | 'admin_adjustment' | 'refund',
  referenceId: string | null,
  note?: string
): Promise<number> {
  if (DEMO) {
    const newBalance = getDemoBalance(userId) + points;
    setDemoBalance(userId, newBalance);
    addDemoTx({
      id: randomUUID(),
      userId,
      type,
      pointsDelta: points,
      balanceAfter: newBalance,
      referenceType: type === 'refund' ? 'order' : type,
      referenceId,
      adminNote: note ?? null,
      createdAt: new Date().toISOString(),
    });
    return newBalance;
  }
  return withTransaction(async (tx) => {
    await tx.query('UPDATE users SET current_points = current_points + ? WHERE id = ?', [
      points,
      userId,
    ]);
    const bal = await tx.query<{ current_points: number }>(
      'SELECT current_points FROM users WHERE id = ?',
      [userId]
    );
    const balance = bal.rows[0]?.current_points ?? 0;
    await tx.query(
      `INSERT INTO point_transactions
        (user_id, type, points_delta, balance_after, reference_type, reference_id, admin_note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        points,
        balance,
        type === 'refund' ? 'order' : type,
        referenceId,
        note ?? null,
      ]
    );
    return balance;
  });
}

export async function deductPoints(
  userId: string,
  points: number,
  type: 'unlock' | 'admin_adjustment' | 'refund',
  referenceId: string | null,
  note?: string
): Promise<number> {
  if (DEMO) {
    const current = getDemoBalance(userId);
    if (current < points) {
      throw apiError('Insufficient points', 402, 'INSUFFICIENT_POINTS', {
        required: points,
        current,
        shortage: points - current,
      });
    }
    const newBalance = current - points;
    setDemoBalance(userId, newBalance);
    addDemoTx({
      id: randomUUID(),
      userId,
      type,
      pointsDelta: -points,
      balanceAfter: newBalance,
      referenceType: type,
      referenceId,
      adminNote: note ?? null,
      createdAt: new Date().toISOString(),
    });
    return newBalance;
  }
  return withTransaction(async (tx) => {
    // Row lock: no two requests can read-and-deduct the same balance concurrently.
    const u = await tx.query<{ current_points: number }>(
      'SELECT current_points FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const current = u.rows[0]?.current_points ?? 0;
    if (!u.rows[0] || current < points) {
      throw apiError('Insufficient points', 402, 'INSUFFICIENT_POINTS', {
        required: points,
        current,
        shortage: points - current,
      });
    }
    await tx.query('UPDATE users SET current_points = current_points - ? WHERE id = ?', [
      points,
      userId,
    ]);
    const bal = await tx.query<{ current_points: number }>(
      'SELECT current_points FROM users WHERE id = ?',
      [userId]
    );
    const balance = bal.rows[0]?.current_points ?? 0;
    await tx.query(
      `INSERT INTO point_transactions
        (user_id, type, points_delta, balance_after, reference_type, reference_id, admin_note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, -points, balance, type, referenceId, note ?? null]
    );
    return balance;
  });
}

/** Has this user already unlocked the article? (idempotency check) */
export async function isArticleUnlocked(userId: string, articleId: string): Promise<boolean> {
  if (DEMO) return isDemoUnlocked(userId, articleId);
  const { rows } = await db.query(
    'SELECT 1 FROM user_unlocked_articles WHERE user_id = ? AND article_id = ? LIMIT 1',
    [userId, articleId]
  );
  return rows.length > 0;
}

/**
 * Record an unlock. Idempotent: the (user_id, article_id) unique key makes
 * INSERT IGNORE a no-op on a second attempt, and we only bump unlock_count
 * when a row was actually inserted.
 */
export async function recordUnlock(userId: string, articleId: string, pointsSpent: number) {
  if (DEMO) {
    const before = isDemoUnlocked(userId, articleId);
    addDemoUnlock({ userId, articleId, pointsSpent, unlockedAt: new Date().toISOString() });
    if (!before) {
      // No DB to bump, but we keep the "wasn't there before" semantics.
    }
    return;
  }
  const res = await db.query(
    `INSERT IGNORE INTO user_unlocked_articles (user_id, article_id, points_spent)
     VALUES (?, ?, ?)`,
    [userId, articleId, pointsSpent]
  );
  if (res.rowCount && res.rowCount > 0) {
    await db.query('UPDATE articles SET unlock_count = unlock_count + 1 WHERE id = ?', [
      articleId,
    ]);
  }
}
