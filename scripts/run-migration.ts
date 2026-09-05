import dotenv from 'dotenv';
dotenv.config();

import { runProjectAppMigrations } from '../server/migrateProjectApp';

async function main() {
  try {
    await runProjectAppMigrations();
    console.log('🎉 Migrasi & Seeding Selesai Sukses!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error saat migrasi:', err);
    process.exit(1);
  }
}

main();
