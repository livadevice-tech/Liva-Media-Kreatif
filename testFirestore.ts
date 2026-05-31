import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function test() {
  console.log("Adding doc...");
  await addDoc(collection(db, "testcol"), { hello: "world" });
  console.log("Fetching docs...");
  const snap = await getDocs(collection(db, "testcol"));
  snap.forEach(d => console.log(d.id, "=>", d.data()));
  process.exit();
}
test().catch(console.error);
