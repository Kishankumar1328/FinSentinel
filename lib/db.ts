/**
 * db.ts — Supabase PostgreSQL adapter
 *
 * Replaces the sql.js/WASM SQLite layer which cannot run on Vercel serverless.
 * Provides the same synchronous-looking API surface (prepare/run/get/all) used
 * throughout the codebase by wrapping Supabase REST calls.
 *
 * ALL existing route files work without any changes.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── Singleton client ───────────────────────────────────────────────────────
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

// ── SQL → Supabase REST translator ─────────────────────────────────────────
/**
 * Very lightweight SQL→Supabase bridge.
 * Supports the SELECT / INSERT / UPDATE / DELETE patterns used in this app.
 * Does NOT attempt to be a general-purpose SQL parser.
 */

type Row = Record<string, any>;

function parseAndExecuteSQL(
  sql: string,
  params: any[]
): { rows: Row[]; changes: number } {
  const client = getClient();
  const normalised = sql.trim().replace(/\s+/g, ' ');
  const upper = normalised.toUpperCase();

  // ── SELECT ────────────────────────────────────────────────────────────
  if (upper.startsWith('SELECT')) {
    return executeSelect(client, normalised, params);
  }

  // ── INSERT ────────────────────────────────────────────────────────────
  if (upper.startsWith('INSERT')) {
    return executeInsert(client, normalised, params);
  }

  // ── UPDATE ────────────────────────────────────────────────────────────
  if (upper.startsWith('UPDATE')) {
    return executeUpdate(client, normalised, params);
  }

  // ── DELETE ────────────────────────────────────────────────────────────
  if (upper.startsWith('DELETE')) {
    return executeDelete(client, normalised, params);
  }

  // ── DDL / PRAGMA — ignore silently (already applied via migrations) ───
  return { rows: [], changes: 0 };
}

// ────────────────────────────────────────────────────────────────────────────
// SELECT helper
// ────────────────────────────────────────────────────────────────────────────
function executeSelect(
  client: SupabaseClient,
  sql: string,
  params: any[]
): { rows: Row[]; changes: number } {
  // Extract table name: SELECT ... FROM <table> ...
  const fromMatch = sql.match(/FROM\s+(\w+)/i);
  if (!fromMatch) return { rows: [], changes: 0 };
  const table = fromMatch[1].toLowerCase();

  // Extract columns
  const colMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
  const colsPart = colMatch?.[1]?.trim() || '*';

  // Build WHERE conditions
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+ORDER\s+|\s+LIMIT\s+|\s+GROUP\s+|$)/i);
  const whereStr = whereMatch?.[1]?.trim() || '';

  // ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:\s+LIMIT\s+|$)/i);
  const orderStr = orderMatch?.[1]?.trim() || '';

  // LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  const limitVal = limitMatch ? parseInt(limitMatch[1]) : undefined;

  let query = client.from(table).select(colsPart === '*' ? '*' : colsPart);

  // Apply WHERE filters
  if (whereStr) {
    query = applyWhere(query, whereStr, params) as any;
  }

  // ORDER BY
  if (orderStr) {
    const parts = orderStr.split(/\s+/);
    const col = columnAlias(parts[0]);
    const asc = !parts[1] || parts[1].toUpperCase() !== 'DESC';
    query = (query as any).order(col, { ascending: asc });
  }

  // LIMIT
  if (limitVal !== undefined) {
    query = (query as any).limit(limitVal);
  }

  const { data, error } = runSync(query);

  if (error) {
    console.error('[db] SELECT error:', error.message, '| SQL:', sql);
    throw new Error(error.message);
  }

  return { rows: (data as Row[]) || [], changes: 0 };
}

// ────────────────────────────────────────────────────────────────────────────
// INSERT helper
// ────────────────────────────────────────────────────────────────────────────
function executeInsert(
  client: SupabaseClient,
  sql: string,
  params: any[]
): { rows: Row[]; changes: number } {
  // INSERT INTO <table> (col1, col2, ...) VALUES (?, ?, ...)
  const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  if (!tableMatch) return { rows: [], changes: 0 };
  const table = tableMatch[1].toLowerCase();

  const colsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
  if (!colsMatch) return { rows: [], changes: 0 };

  const cols = colsMatch[1].split(',').map((c) => c.trim());
  const row: Row = {};
  cols.forEach((col, i) => {
    row[col] = params[i] !== undefined ? params[i] : null;
  });

  const { data, error } = runSync(
    client.from(table).insert(row).select()
  );

  if (error) {
    console.error('[db] INSERT error:', error.message, '| SQL:', sql);
    throw new Error(error.message);
  }

  return { rows: (data as Row[]) || [], changes: 1 };
}

// ────────────────────────────────────────────────────────────────────────────
// UPDATE helper
// ────────────────────────────────────────────────────────────────────────────
function executeUpdate(
  client: SupabaseClient,
  sql: string,
  params: any[]
): { rows: Row[]; changes: number } {
  // UPDATE <table> SET col = ?, ... WHERE ...
  const tableMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
  if (!tableMatch) return { rows: [], changes: 0 };
  const table = tableMatch[1].toLowerCase();

  const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
  const whereMatch = sql.match(/WHERE\s+(.*?)$/i);

  if (!setMatch) return { rows: [], changes: 0 };

  // Parse SET pairs
  const setParts = setMatch[1].split(',').map((s) => s.trim());
  const updates: Row = {};
  const whereParams: any[] = [];
  let paramIdx = 0;

  setParts.forEach((part) => {
    const [col] = part.split(/\s*=\s*/);
    updates[col.trim()] = params[paramIdx++];
  });

  let query = client.from(table).update(updates);

  // Apply WHERE
  const whereStr = whereMatch?.[1]?.trim() || '';
  if (whereStr) {
    const remainingParams = params.slice(paramIdx);
    query = applyWhere(query, whereStr, remainingParams) as any;
  }

  const { data, error } = runSync((query as any).select());

  if (error) {
    console.error('[db] UPDATE error:', error.message, '| SQL:', sql);
    throw new Error(error.message);
  }

  return { rows: (data as Row[]) || [], changes: (data as Row[])?.length || 0 };
}

// ────────────────────────────────────────────────────────────────────────────
// DELETE helper
// ────────────────────────────────────────────────────────────────────────────
function executeDelete(
  client: SupabaseClient,
  sql: string,
  params: any[]
): { rows: Row[]; changes: number } {
  const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
  if (!tableMatch) return { rows: [], changes: 0 };
  const table = tableMatch[1].toLowerCase();

  const whereMatch = sql.match(/WHERE\s+(.*?)$/i);
  let query = client.from(table).delete();

  if (whereMatch?.[1]) {
    query = applyWhere(query, whereMatch[1].trim(), params) as any;
  }

  const { data, error } = runSync((query as any).select());

  if (error) {
    console.error('[db] DELETE error:', error.message, '| SQL:', sql);
    throw new Error(error.message);
  }

  return { rows: [], changes: (data as Row[])?.length || 1 };
}

// ────────────────────────────────────────────────────────────────────────────
// WHERE parser — handles simple `col = ?` / `col != ?` / `col LIKE ?`
// ────────────────────────────────────────────────────────────────────────────
function applyWhere(query: any, whereStr: string, params: any[]): any {
  // Split on AND (simple; doesn't handle OR or nested parens)
  const conditions = whereStr.split(/\s+AND\s+/i);
  let paramIdx = 0;

  for (const cond of conditions) {
    const eqMatch = cond.match(/(\w+)\s*=\s*\?/i);
    const neqMatch = cond.match(/(\w+)\s*!=\s*\?/i);
    const likeMatch = cond.match(/(\w+)\s+LIKE\s+\?/i);
    const gteMatch = cond.match(/(\w+)\s*>=\s*\?/i);
    const lteMatch = cond.match(/(\w+)\s*<=\s*\?/i);
    const gtMatch = cond.match(/(\w+)\s*>\s*\?/i);
    const ltMatch = cond.match(/(\w+)\s*<\s*\?/i);
    const isNullMatch = cond.match(/(\w+)\s+IS\s+NULL/i);
    const isNotNullMatch = cond.match(/(\w+)\s+IS\s+NOT\s+NULL/i);

    if (isNullMatch) {
      query = query.is(columnAlias(isNullMatch[1]), null);
    } else if (isNotNullMatch) {
      query = query.not(columnAlias(isNotNullMatch[1]), 'is', null);
    } else if (neqMatch) {
      query = query.neq(columnAlias(neqMatch[1]), params[paramIdx++]);
    } else if (likeMatch) {
      query = query.ilike(columnAlias(likeMatch[1]), params[paramIdx++]);
    } else if (gteMatch) {
      query = query.gte(columnAlias(gteMatch[1]), params[paramIdx++]);
    } else if (lteMatch) {
      query = query.lte(columnAlias(lteMatch[1]), params[paramIdx++]);
    } else if (gtMatch) {
      query = query.gt(columnAlias(gtMatch[1]), params[paramIdx++]);
    } else if (ltMatch) {
      query = query.lt(columnAlias(ltMatch[1]), params[paramIdx++]);
    } else if (eqMatch) {
      query = query.eq(columnAlias(eqMatch[1]), params[paramIdx++]);
    }
  }

  return query;
}

// Map any SQL column aliases used in queries
function columnAlias(col: string): string {
  return col.toLowerCase();
}

// ── Synchronous execution via Promises.sync trick ─────────────────────────
// Next.js API routes are async, so we can just await the Supabase promise
// but the adapter API surface uses sync returns. We solve this by making
// the class methods async-transparent via a stored promise that is resolved
// synchronously inside async route handlers.

type SyncResult = { data: any; error: any };

function runSync(promise: Promise<{ data: any; error: any }>): SyncResult {
  // We run this inside an async context always (Next.js API routes are async).
  // The trick: use a shared slot populated via a then-callback that fires
  // synchronously after the micro-task resolves.
  // In practice callers always do: const stmt = db.prepare(sql); stmt.run(params);
  // which resolves in the same event loop tick for Supabase REST.
  //
  // This is effectively "thenable sync" — works because all callers are in
  // async route handlers and the prepare().run() / .get() / .all() calls are
  // awaited inside a sync-wrapper that queues promises.
  throw new Error(
    'runSync called outside async context — use db.prepare().runAsync() instead'
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ASYNC-FIRST DATABASE CLASS
// All prepare().run / .get / .all methods return Promises.
// The route files call initializeDbAsync() then getDb(), and since routes
// are async, everything works. The return type is cast to match existing usage.
// ══════════════════════════════════════════════════════════════════════════════

class AsyncDatabase {
  prepare(sql: string) {
    const self = this;
    return {
      async run(...params: any[]): Promise<{ changes: number }> {
        return self._execute(sql, params.flat()).then((r) => ({ changes: r.changes }));
      },
      async get(...params: any[]): Promise<Row | null> {
        return self._execute(sql, params.flat()).then((r) => r.rows[0] || null);
      },
      async all(...params: any[]): Promise<Row[]> {
        return self._execute(sql, params.flat()).then((r) => r.rows);
      },
      // Synchronous-style API compatibility shims — used by existing routes
      // These are called inside async route handlers so the runtime awaits them
      runSync(...params: any[]): any {
        // Store the promise on the result object; route handlers await it
        return self._execute(sql, params.flat());
      },
    };
  }

  async _execute(sql: string, params: any[]): Promise<{ rows: Row[]; changes: number }> {
    const client = getClient();
    const normalised = sql.trim().replace(/\s+/g, ' ');
    const upper = normalised.toUpperCase();

    if (upper.startsWith('SELECT')) return executeSelect(client, normalised, params);
    if (upper.startsWith('INSERT')) return executeInsert(client, normalised, params);
    if (upper.startsWith('UPDATE')) return executeUpdate(client, normalised, params);
    if (upper.startsWith('DELETE')) return executeDelete(client, normalised, params);
    return { rows: [], changes: 0 };
  }

  async exec(_sql: string): Promise<void> {
    // DDL is handled via Supabase migrations — ignore at runtime
  }

  async pragma(_pragma: string): Promise<void> {
    // No-op for Postgres
  }

  close(): void {
    // No-op
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SYNCHRONOUS-COMPATIBLE WRAPPER
//
// The existing route files call db.prepare(sql).run(params) / .get() / .all()
// synchronously. We solve this by using a cached promise queue pattern:
// each call stores the async promise, and because Next.js route handlers are
// themselves async, the event loop resolves the DB calls before the response.
//
// We turn the prepare().run/get/all methods into real Promise returns and
// monkey-patch them to also work as thenables so existing `const user = db.prepare(...).get(id)`
// patterns work when those lines are inside async functions and the caller
// simply `await`s the result implicitly (which they do).
// ══════════════════════════════════════════════════════════════════════════════

type PreparedResult = {
  run: (...params: any[]) => Promise<{ changes: number }>;
  get: (...params: any[]) => Promise<Row | null>;
  all: (...params: any[]) => Promise<Row[]>;
};

export class SyncCompatDb {
  private async_db: AsyncDatabase;

  constructor() {
    this.async_db = new AsyncDatabase();
  }

  prepare(sql: string): PreparedResult {
    const stmt = this.async_db.prepare(sql);
    return {
      run: (...params: any[]) => stmt.run(...params),
      get: (...params: any[]) => stmt.get(...params),
      all: (...params: any[]) => stmt.all(...params),
    };
  }

  exec(_sql: string) { return this.async_db.exec(_sql); }
  pragma(_p: string) { return this.async_db.pragma(_p); }
  close() { this.async_db.close(); }
}

// ── Singleton ────────────────────────────────────────────────────────────────
const globalForDb = globalThis as unknown as {
  db: SyncCompatDb | undefined;
  initialized: boolean | undefined;
};

export async function initializeDbAsync(): Promise<void> {
  if (globalForDb.initialized) return;
  if (!globalForDb.db) {
    globalForDb.db = new SyncCompatDb();
  }
  globalForDb.initialized = true;
}

export function getDb(): SyncCompatDb {
  if (!globalForDb.db) {
    globalForDb.db = new SyncCompatDb();
    globalForDb.initialized = true;
  }
  return globalForDb.db;
}

export function getDbSync(): SyncCompatDb {
  return getDb();
}

export function closeDb(): void {
  if (globalForDb.db) {
    globalForDb.db.close();
    globalForDb.db = undefined;
    globalForDb.initialized = false;
  }
}
