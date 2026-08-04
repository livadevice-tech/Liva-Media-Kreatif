require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const [rows] = await pool.query('SELECT setting_value FROM global_settings WHERE setting_key = "brandResources"');
  console.log(rows[0] ? rows[0].setting_value : 'NULL');
  process.exit(0);
}
test();
