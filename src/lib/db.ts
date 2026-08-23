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
