
import "dotenv/config";
import { queryMany } from "./server/db.js";

(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/violations?hostId=h15");
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();

