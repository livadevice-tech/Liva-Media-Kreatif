/**
 * src/firestoreSync.ts — DEPRECATED
 * ===================================
 * File ini telah digantikan oleh fungsi syncToMySQL() di src/api.ts.
 * Firebase Firestore telah dihapus dari project ini.
 *
 * Gunakan: import { syncToMySQL } from './api';
 *
 * @see src/api.ts
 */

// Re-export syncToMySQL dari api.ts sebagai pengganti syncToFirestore
// agar tidak perlu mengubah semua import di App.tsx sekaligus
export { syncToMySQL as syncToFirestore } from './api';
