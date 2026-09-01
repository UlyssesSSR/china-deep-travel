import mysql from 'mysql2/promise';

/**
 * MySQL connection layer (mysql2/promise).
 *
 * Wraps the pool so the rest of the app uses a single `db.query(sql, params)`
 * signature that returns `{ rows, rowCount }` (same contract the PostgreSQL
 * layer used). Placeholders are `?` (positional). Use `db.withTransaction` for
 * multi-statement atomic work (point ledger, unlock).
 *
 * No connection is opened at import time, so `next build` / demo mode (no
 * DATABASE_URL) still work. Queries only fail at request time when the DB is
 * actually hit.
 */

const url = process.env.DATABASE_URL;

if (!url) {
  console.warn('[db] DATABASE_URL is not set — database queries will fail at runtime (demo mode uses mock data).');
}

const pool = mysql.createPool(
  url
    ? {
        uri: url,
        connectionLimit: 10,
        waitForConnections: true,
        connectTimeout: 5000,
      }
    : {
        host: '127.0.0.1',
        user: 'root',
        database: 'cpt_demo',
        connectionLimit: 1,
        connectTimeout: 1000,
      }
);

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

function normalize(res: any): QueryResult {
  if (Array.isArray(res)) {
    return { rows: res as any[], rowCount: res.length };
  }
  // ResultSetHeader for INSERT/UPDATE/DELETE
  const rh = res as { affectedRows?: number; insertId?: number };
  return { rows: [], rowCount: rh.affectedRows ?? 0 };
}

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const [res] = (await pool.query(sql, params)) as any;
    return normalize(res) as QueryResult<T>;
  } catch (err) {
    console.error('[db] query error:', { sql, params, err });
    throw err;
  }
}

/** A transaction-scoped query helper (same contract as `query`). */
export interface Tx {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
}

/**
 * Run `fn` inside a single MySQL transaction with row locking available.
 * Rolls back automatically on throw.
 */
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const tx: Tx = {
      async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
        const [res] = (await conn.query(sql, params)) as any;
        return normalize(res) as QueryResult<T>;
      },
    };
    const out = await fn(tx);
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export const db = { query, withTransaction, pool };
export default db;
