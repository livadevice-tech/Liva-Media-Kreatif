
import "dotenv/config";
import { queryMany } from "./server/db.js";

(async () => {
  try {
    const columns = await queryMany("SELECT * FROM hosts WHERE name LIKE \"%Ajeng Monika%\"");
    console.log(columns);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();

