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
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "+07:00",
      dateStrings: true,
    });

    console.log(`✅ MySQL pool terhubung ke ${host}/${database}`);
  }
  return pool;
}

export async function queryOne<T = any>(sql: string, params: any[]): Promise<T | null> {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  const arr = rows as T[];
  return arr.length > 0 ? arr[0] : null;
}

export async function queryMany<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: any[]): Promise<mysql.ResultSetHeader> {
  const db = getPool();
  const [result] = await db.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
