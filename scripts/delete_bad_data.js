import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const app = initializeApp({ projectId: "ai-studio-2ba83602-e04a-4c6b-89b4-d3333f81116e" });
const db = getFirestore(app);

async function run() {
  const q = collection(db, 'brand_performance_logs');
  const snap = await getDocs(q);
  let badCnt = 0;
  for (const row of snap.docs) {
    const data = row.data();
    if (data.date && data.date > '2026-06-16') {
      console.log('Deleting bad date:', data.date);
      await deleteDoc(doc(db, 'brand_performance_logs', row.id));
      badCnt++;
    }
  }
  console.log('Deleted total bad dates:', badCnt);
  process.exit(0);
}

run().catch(console.error);
  