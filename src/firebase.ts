import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;

console.log("Firebase Init - databaseId is:", dbId);

// Force real-time live database connection, do not store/cache records in browser IndexedDB/localCache
let db: any;

try {
  const firestoreSettings = {
    // Disable persistent IndexedDB cache to prevent offline split-brain across devices/iframes
    experimentalForceLongPolling: true
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
