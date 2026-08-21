const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: '153.92.15.31',
    port: 3306,
    user: 'u287082095_systemuser',
    password: 'Liva123@@',
    database: 'u287082095_systemdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const [analyses] = await pool.query('SELECT * FROM brand_performance_analyses LIMIT 1');
  console.log("Analyses:", analyses);
  
  if (analyses.length > 0) {
      const [rows] = await pool.query('SELECT platform, report_date, report_datetime FROM reporting_upload_rows WHERE brand_id = ? LIMIT 5', [analyses[0].brand_id]);
      console.log("Rows for brand:", rows);
  }
  
  pool.end();
}
main().catch(console.error);
