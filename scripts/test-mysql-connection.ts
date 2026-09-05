import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testing MySQL Connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Port:', process.env.DB_PORT || 3306);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
      connectTimeout: 10000,
    });

    console.log('✅ Connected successfully to MySQL Hostinger!');
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables found count:', Array.isArray(rows) ? rows.length : 0);
    await connection.end();
  } catch (error: any) {
    console.error('❌ Connection error:', error.message);
    console.error('Code:', error.code);
  }
}

testConnection();
