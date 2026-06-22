import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;

console.log("Firebase Init - databaseId is:", dbId);

let db: any;

try {
  const firestoreSettings = {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true
  };
  db = dbId 
    ? initializeFirestore(app, firestoreSettings, dbId)
    : initializeFirestore(app, firestoreSettings);
} catch (error) {
  console.warn("Failed to initialize Firestore with persistent local cache; performing fallback:", error);
  try {
    db = dbId 
      ? initializeFirestore(app, { experimentalForceLongPolling: true }, dbId)
      : initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch (innerError) {
    console.error("Critical: Default Firestore initialization failed, falling back to absolute default settings:", innerError);
    db = dbId 
      ? initializeFirestore(app, {}, dbId)
      : initializeFirestore(app, {});
  }
}

export { db };

export const auth = getAuth();
