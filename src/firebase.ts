import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;

console.log("Firebase Init - databaseId is:", dbId);

// Mengaktifkan persistent local cache agar pengguna tetap bisa melihat
// dan mengedit data mereka meskipun offline atau limit kuota tercapai.
let db: any;

try {
  const firestoreSettings = {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  };
  db = dbId 
    ? initializeFirestore(app, firestoreSettings, dbId)
    : initializeFirestore(app, firestoreSettings);
} catch (error) {
  console.warn("Failed to initialize Firestore with settings; performing default fallback:", error);
  try {
    db = dbId 
      ? initializeFirestore(app, {}, dbId)
      : initializeFirestore(app, {});
  } catch (innerError) {
    console.error("Critical: Default Firestore initialization failed:", innerError);
  }
}

export { db };

export const auth = getAuth();

