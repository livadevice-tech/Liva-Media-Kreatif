
import "dotenv/config";
import { queryMany } from "./server/db.js";

(async () => {
  try {
    const columns = await queryMany("SELECT * FROM host_violations");
    console.log(columns);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();

