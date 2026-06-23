import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'liva_agency_db',
  multipleStatements: true, // IMPORTANT: Allows running multiple SQL queries from one file
};

const MIGRATIONS_DIR = path.join(process.cwd(), 'scripts', 'migrations');

async function main() {
  console.log('='.repeat(50));
  console.log('  LIVA MEDIA KREATIF - Database Migration');
  console.log('='.repeat(50));

  let conn: mysql.Connection;
  try {
    // We initially connect WITHOUT specifying database, in case the database doesn't exist yet
    // However, some hosts require you to connect to a specific DB. We'll try the specific one first.
    // If it fails because of "Unknown database", we'll connect without DB to create it.
    try {
        conn = await mysql.createConnection(dbConfig);
    } catch (err: any) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log(`Database '${dbConfig.database}' belum ada. Membuatnya sekarang...`);
            const configWithoutDb = { ...dbConfig };
            delete (configWithoutDb as any).database;
            conn = await mysql.createConnection(configWithoutDb);
            await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await conn.changeUser({ database: dbConfig.database });
        } else {
            throw err;
        }
    }
    
    console.log(`✅ Terhubung ke MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  } catch (err: any) {
    console.error(`❌ Gagal koneksi ke MySQL:`, err.message);
    process.exit(1);
  }

  try {
    // 1. Create migrations tracking table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Get already executed migrations
    const [rows] = await conn.execute(`SELECT migration_name FROM _migrations`);
    const executedMigrations = new Set((rows as any[]).map(r => r.migration_name));

    // 3. Read migration files
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('Tidak ada folder migrations.');
      process.exit(0);
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, etc.)

    let executedCount = 0;

    // 4. Execute pending migrations
    for (const file of files) {
      if (!executedMigrations.has(file)) {
        console.log(`⏳ Menjalankan migrasi: ${file}...`);
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        try {
          // Execute the entire SQL script
          await conn.query(sql);
          
          // Record success
          await conn.execute(
            `INSERT INTO _migrations (migration_name) VALUES (?)`,
            [file]
          );
          console.log(`   ✅ Selesai: ${file}`);
          executedCount++;
        } catch (migrationError: any) {
          console.error(`   ❌ Gagal mengeksekusi ${file}:`);
          console.error(migrationError.message);
          throw migrationError; // Stop on first failure
        }
      }
    }

    if (executedCount === 0) {
      console.log('✨ Semua migrasi sudah up-to-date. Tidak ada yang perlu dieksekusi.');
    } else {
      console.log(`\n🎉 Berhasil mengeksekusi ${executedCount} file migrasi.`);
    }

  } catch (err: any) {
    console.error('\n❌ Terjadi kesalahan saat migrasi:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
