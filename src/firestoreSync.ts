import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export const syncToFirestore = async (collectionName: string, oldArray: any[], newArray: any[]) => {
  try {
    const oldIds = oldArray.map((x: any) => x.id).filter(Boolean);
    const newIds = newArray.map((x: any) => x.id).filter(Boolean);
    
    const toDelete = oldIds.filter((id: string) => !newIds.includes(id));
    const toUpdateOrAdd = newArray;
    
    let batch = writeBatch(db);
    let count = 0;

    const commitBatch = async () => {
      if (count > 0) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    };

    // Queue deletes
    for (const id of toDelete) {
      if (id) {
        batch.delete(doc(db, collectionName, id));
        count++;
        if (count >= 400) {
          await commitBatch();
        }
      }
    }
    
    // Queue sets/updates
    for (const item of toUpdateOrAdd) {
      if (!item.id) continue;
      const oldItem = oldArray.find((x: any) => x.id === item.id);
      
      // Only write physical updates to Firestore to avoid loop feedback spam
      if (!oldItem || JSON.stringify(item) !== JSON.stringify(oldItem)) {
        // Strip undefined properties before sending to Firestore
        const cleanedItem = Object.fromEntries(
          Object.entries(item).filter(([k, v]) => v !== undefined)
        );
        batch.set(doc(db, collectionName, item.id), cleanedItem);
        count++;
        if (count >= 400) {
          await commitBatch();
        }
      }
    }
    
    // Commit remaining operations
    await commitBatch();
  } catch (err) {
    console.error(`Gagal melakukan sync ke Firestore batch untuk ${collectionName}:`, err);
  }
};
