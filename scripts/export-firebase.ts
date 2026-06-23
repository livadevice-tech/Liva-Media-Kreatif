/**
 * export-firebase.ts
 * ==================
 * Script untuk mengexport SEMUA data dari Firebase Firestore
 * ke file JSON lokal sebelum migrasi ke MySQL.
 *
 * CARA PAKAI:
 *   1. Pastikan firebase-applet-config.json ada dan valid
 *   2. Jalankan: npx tsx scripts/export-firebase.ts
 *   3. Hasil export akan tersimpan di: scripts/firebase-export/
 *
 * ⚠️  JALANKAN DI BRANCH feature/mysql-migration
 * ⚠️  JANGAN HAPUS FILE EXPORT INI SAMPAI MIGRASI SELESAI
 */

import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ------------------------------------------------------------------
// COLLECTIONS yang akan diexport (sesuaikan jika ada collection lain)
// ------------------------------------------------------------------
const COLLECTIONS_TO_EXPORT = [
  'hosts',
  'logs',
  'schedules',
  'kpi_alerts',
  'client_brands',
  'client_leads',
  'admin_accounts',
  'client_reporting',
  'studio_items',
];

// ------------------------------------------------------------------
// Setup Firebase Admin SDK
// ------------------------------------------------------------------
let app: App;

// Coba inisialisasi menggunakan service account (lebih aman untuk script)
const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  // Gunakan service account jika tersedia
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('✅ Firebase Admin: Menggunakan service account');
} else {
  // Fallback: gunakan Application Default Credentials
  // (harus login dulu dengan: gcloud auth application-default login)
  const { initializeApp: initDefault } = await import('firebase-admin/app');
  app = initDefault();
  console.log('ℹ️  Firebase Admin: Menggunakan Application Default Credentials');
  console.log('   Jika gagal, download service account dari Firebase Console dan simpan sebagai firebase-service-account.json');
}

const db = getFirestore(app);

// ------------------------------------------------------------------
// Buat direktori output
// ------------------------------------------------------------------
const outputDir = path.join(process.cwd(), 'scripts', 'firebase-export');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ------------------------------------------------------------------
// Export semua collections
// ------------------------------------------------------------------
async function exportCollection(collectionName: string): Promise<number> {
  console.log(`\n📦 Mengexport collection: ${collectionName}`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`   ⚠️  Collection "${collectionName}" kosong atau tidak ditemukan`);
      return 0;
    }

    const documents: Record<string, any>[] = [];
    
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const outputPath = path.join(outputDir, `${collectionName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2), 'utf-8');
    
    console.log(`   ✅ ${documents.length} dokumen tersimpan → ${outputPath}`);
    return documents.length;
    
  } catch (error: any) {
    console.error(`   ❌ Gagal export "${collectionName}":`, error.message);
    return 0;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  LIVA MEDIA KREATIF - Firebase Firestore Export');
  console.log('  Waktu: ' + new Date().toLocaleString('id-ID'));
  console.log('='.repeat(60));
  
  const summary: Record<string, number> = {};
  let totalDocs = 0;

  for (const collection of COLLECTIONS_TO_EXPORT) {
    const count = await exportCollection(collection);
    summary[collection] = count;
    totalDocs += count;
  }

  // Simpan summary
  const summaryPath = path.join(outputDir, '_export-summary.json');
  const summaryData = {
    exportedAt: new Date().toISOString(),
    totalDocuments: totalDocs,
    collections: summary,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('  EXPORT SELESAI');
  console.log('='.repeat(60));
  console.log(`\n📊 Ringkasan Export:`);
  for (const [col, count] of Object.entries(summary)) {
    const icon = count > 0 ? '✅' : '⚠️ ';
    console.log(`   ${icon} ${col}: ${count} dokumen`);
  }
  console.log(`\n   Total: ${totalDocs} dokumen`);
  console.log(`   Output: ${outputDir}`);
  console.log('\n⚠️  PENTING: Simpan folder firebase-export/ di tempat aman!');
  console.log('   Jangan hapus sampai import ke MySQL selesai dan diverifikasi.\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Export gagal:', err);
  process.exit(1);
});
