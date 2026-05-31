import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export const syncToFirestore = async (collectionName: string, oldArray: any[], newArray: any[]) => {
  const oldIds = oldArray.map((x: any) => x.id);
  const newIds = newArray.map((x: any) => x.id);
  
  const toDelete = oldIds.filter((id: string) => !newIds.includes(id));
  const toUpdateOrAdd = newArray;
  
  for (const id of toDelete) {
    if (id) deleteDoc(doc(db, collectionName, id)).catch(console.error);
  }
  
  for (const item of toUpdateOrAdd) {
    if (!item.id) continue;
    const oldItem = oldArray.find((x: any) => x.id === item.id);
    if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
      // Strip undefined properties before sending to Firestore
      const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([k, v]) => v !== undefined)
      );
      setDoc(doc(db, collectionName, item.id), cleanedItem).catch(console.error);
    }
  }
};
