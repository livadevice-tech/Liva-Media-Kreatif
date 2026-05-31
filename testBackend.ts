import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, initializeFirestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
const db = dbId 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, dbId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

async function run() {
  try {
    const coll = collection(db, "hosts");
    await addDoc(coll, { name: "TestHost_" + Date.now() });
    console.log("Write success!");

    const snap = await getDocs(coll);
    console.log("Read success! Docs count:", snap.size);
  } catch(e) {
    console.error("Firebase error details:", e);
  }
}
run();
