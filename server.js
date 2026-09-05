/**
 * Hostinger & Production Entry Point
 * Hostinger default startup file looks for server.js
 * This forwards directly to the compiled production server in dist/server.cjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compiledPath = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(compiledPath)) {
  console.log('📦 dist/server.cjs belum ditemukan, mencoba menjalankan build...');
  try {
    const { execSync } = await import('node:child_process');
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Gagal menjalankan build otomatis:', err);
  }
}

// Import & jalankan server hasil build
import('./dist/server.cjs');
