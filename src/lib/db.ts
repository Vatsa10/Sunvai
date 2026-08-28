/**
 * Database access. One pool, reused across serverless invocations.
 *
 * We connect over the session pooler rather than the transaction pooler because
 * ledger_append() takes a transaction-scoped advisory lock, and pgbouncer in transaction mode
 * cannot be relied on to keep a session's locks where we put them.
 */

import { Pool, type PoolClient } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __sunvaiPool: Pool | undefined;
}

function connectionString(): string {
  const raw = process.env.SUPABASE_DB_URL;
  if (!raw) throw new Error('SUPABASE_DB_URL is not set');
  // Transaction pooler (6543) cannot hold session-scoped state; the ledger needs 5432.
  return raw.trim().replace(':6543/', ':5432/');
}

export function pool(): Pool {
  globalThis.__sunvaiPool ??= new Pool({
    connectionString: connectionString(),
    max: 4,
    idleTimeoutMillis: 20_000,
    // A paused free-tier database must fail fast, not hang. A reviewer clicking once will not
    // wait thirty seconds for a socket to time out; they will close the tab. Five seconds is
    // long enough for a cold pooler to wake and short enough that the fixture fallback renders
    // while they are still looking at the screen.
    connectionTimeoutMillis: 5_000,
    query_timeout: 8_000,
    statement_timeout: 8_000,
    ssl: { rejectUnauthorized: false },
  });
  return globalThis.__sunvaiPool;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(text, params as never[]);
  return res.rows as T[];
}

export async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * A state change and its ledger entry are written together or not at all. If the event fails,
 * the state change rolls back — otherwise the ledger would quietly stop being the record of
 * what happened, which is the one thing it is for.
 */
export async function transaction<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('begin');
    await client.query(`set local statement_timeout = '300s'`);
    const out = await fn(client);
    await client.query('commit');
    return out;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export type LedgerRow = {
  seq: string;
  type: string;
  occurred_at: string;
  payload: unknown;
  prev_hash: string;
  hash: string;
};

/** The only way anything gets into the ledger. */
export async function appendEvent(
  client: PoolClient,
  args: { grievanceId: string | null; citizenId: string | null; type: string; payload: unknown },
): Promise<LedgerRow> {
  const res = await client.query(
    `select seq, type,
            to_char(occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as occurred_at,
            payload, prev_hash, hash
       from ledger_append($1, $2, $3, $4::jsonb)`,
    [args.grievanceId, args.citizenId, args.type, JSON.stringify(args.payload)],
  );
  return res.rows[0] as LedgerRow;
}

/**
 * Is this the database being unreachable, rather than our SQL being wrong?
 *
 * We only fall back to committed fixtures for the first kind. A bad query must still be a loud
 * error — silently serving fixtures over a real bug is how a demo starts lying.
 */
export function isDbUnavailable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as NodeJS.ErrnoException & { code?: string }).code ?? '';
  if (
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNRESET', 'EPIPE', 'ENETUNREACH'].includes(code)
  ) {
    return true;
  }
  // Postgres class 57/53: shutdown, too many connections, cannot connect now.
  if (/^(57P0[123]|53300|08\d{3})$/.test(code)) return true;
  const m = err.message.toLowerCase();
  return (
    m.includes('timeout') ||
    m.includes('terminating connection') ||
    m.includes('connection terminated') ||
    m.includes('econnrefused') ||
    m.includes('getaddrinfo') ||
    m.includes('supabase_db_url is not set') ||
    m.includes('server closed the connection')
  );
}
