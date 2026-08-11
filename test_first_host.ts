
import "dotenv/config";
import { queryMany } from "./server/db.js";

(async () => {
  try {
    const columns = await queryMany("SELECT id, name FROM hosts ORDER BY name ASC LIMIT 2");
    console.log(columns);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();

