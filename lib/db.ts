import mysql from 'mysql2/promise';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

let connectionPool: mysql.Pool | null = null;

const globalForDb = globalThis as unknown as {
  connectionPool: mysql.Pool | undefined;
  initialized: boolean | undefined;
};

export async function initializeDbAsync(): Promise<void> {
  if (globalForDb.initialized && globalForDb.connectionPool) return;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    globalForDb.connectionPool = mysql.createPool({
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
      uri: DATABASE_URL,
    });

    // Test the connection
    const connection = await globalForDb.connectionPool.getConnection();
    await connection.ping();
    connection.release();

    console.log('[v0] Database connected successfully');
    globalForDb.initialized = true;
  } catch (error) {
    console.error('[v0] Failed to connect to database:', error);
    throw error;
  }
}

export function getDb(): mysql.Pool {
  if (!globalForDb.connectionPool) {
    throw new Error('Database not initialized. Call initializeDbAsync() first.');
  }
  return globalForDb.connectionPool;
}

export async function closeDb(): Promise<void> {
  if (globalForDb.connectionPool) {
    await globalForDb.connectionPool.end();
    globalForDb.connectionPool = undefined;
    globalForDb.initialized = false;
  }
}

// Helper functions for common query operations
export async function executeQuery<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const connection = await getDb().getConnection();
  try {
    const [rows] = await connection.query<T>(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

export async function executeInsert(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const connection = await getDb().getConnection();
  try {
    const [result] = await connection.query<ResultSetHeader>(sql, params);
    return result;
  } finally {
    connection.release();
  }
}

export async function executeUpdate(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const connection = await getDb().getConnection();
  try {
    const [result] = await connection.query<ResultSetHeader>(sql, params);
    return result;
  } finally {
    connection.release();
  }
}

export async function executeDelete(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const connection = await getDb().getConnection();
  try {
    const [result] = await connection.query<ResultSetHeader>(sql, params);
    return result;
  } finally {
    connection.release();
  }
}

export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
