import mysql from 'mysql2/promise';
import * as fs from 'node:fs';

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
 *
 * TiDB Cloud SSL support: the connection URL may include
 *   `?ssl-mode=VERIFY_IDENTITY&ssl-ca=/path/to/ca.pem`
 * mysql2's built-in URL parser doesn't recognize these, so we strip them
 * from the URL and pass them as a proper `ssl` object instead.
 */

const url = process.env.DATABASE_URL;

if (!url) {
  console.warn('[db] DATABASE_URL is not set — database queries will fail at runtime (demo mode uses mock data).');
}

function parseSslFromUrl(databaseUrl: string): {
  cleanUrl: string;
  ssl?: { ca: string; rejectUnauthorized: boolean };
} {
  try {
    const u = new URL(databaseUrl);
    const sslMode = u.searchParams.get('ssl-mode');
    const sslCa = u.searchParams.get('ssl-ca');
    if (!sslMode && !sslCa) {
      return { cleanUrl: databaseUrl };
    }
    // Strip our custom ssl-* params; let mysql2 parse the rest.
    u.searchParams.delete('ssl-mode');
    u.searchParams.delete('ssl-ca');
    if (!sslCa) {
      return { cleanUrl: u.toString() };
    }
    let ca: string;
    try {
      ca = fs.readFileSync(sslCa, 'utf8');
    } catch (e) {
      console.warn(`[db] could not read ssl-ca file ${sslCa}: ${(e as Error).message}`);
      return { cleanUrl: u.toString() };
    }
    return {
      cleanUrl: u.toString(),
      ssl: {
        ca,
        rejectUnauthorized: sslMode !== 'REQUIRED',
      },
    };
  } catch {
    return { cleanUrl: databaseUrl };
  }
}

const { cleanUrl, ssl } = url ? parseSslFromUrl(url) : { cleanUrl: '', ssl: undefined };

const pool = mysql.createPool(
  url
    ? {
        uri: cleanUrl,
        charset: 'utf8mb4',
        connectionLimit: 10,
        waitForConnections: true,
        connectTimeout: 5000,
        ...(ssl ? { ssl } : {}),
      }
    : {
        host: '127.0.0.1',
        user: 'root',
        database: 'cpt_demo',
        charset: 'utf8mb4',
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
