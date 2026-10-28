import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;

    if (!host || !user || !database) {
      throw new Error(
        "Konfigurasi database MySQL belum lengkap. Cek DB_HOST, DB_USER, DB_PASS, DB_NAME di .env",
      );
    }

    pool = mysql.createPool({
      host,
      port: parseInt(process.env.DB_PORT || "3306"),
      user,
      password: password || "",
      database,
      waitForConnections: true,
      connectionLimit: 4,
      maxIdle: 2,
      idleTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: "utf8mb4",
      timezone: "+07:00",
      dateStrings: true,
    });

    (pool as any).pool.on("connection", (conn: any) => {
      conn.query("SET time_zone = '+07:00'");
    });

    console.log(`✅ MySQL pool terhubung ke ${host}/${database}`);
  }
  return pool;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.code === "ER_CON_COUNT_ERROR" ||
        err?.code === "PROTOCOL_CONNECTION_LOST" ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT";
      if (isTransient && i < retries) {
        console.warn(`[DB Retry] Percobaan ${i + 1}/${retries} gagal (${err.code}). Menunggu ${delayMs * (i + 1)}ms...`);
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function queryOne<T = any>(sql: string, params: any[]): Promise<T | null> {
  return withRetry(async () => {
    const db = getPool();
    const [rows] = await db.execute(sql, params);
    const arr = rows as T[];
    return arr.length > 0 ? arr[0] : null;
  });
}

export async function queryMany<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return withRetry(async () => {
    const db = getPool();
    const [rows] = await db.execute(sql, params);
    return rows as T[];
  });
}

export async function execute(sql: string, params: any[]): Promise<mysql.ResultSetHeader> {
  return withRetry(async () => {
    const db = getPool();
    const [result] = await db.execute(sql, params);
    return result as mysql.ResultSetHeader;
  });
}
