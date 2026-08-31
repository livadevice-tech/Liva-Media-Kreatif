import 'dotenv/config';
import { queryMany } from './server/db';
async function run() {
  const brands = await queryMany("SELECT * FROM client_brands WHERE name LIKE '%Mirael%'");
  for (const b of brands) {
     const sessions = await queryMany("SELECT * FROM brand_sessions WHERE brand_id = ?", [b.id]);
     console.log(b.name, "sessions:", JSON.stringify(sessions, null, 2));
  }
  process.exit(0);
}
run();
