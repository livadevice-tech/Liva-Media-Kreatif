
import "dotenv/config";
import { queryMany } from "./server/db.js";

(async () => {
  try {
    const hostId = "h15";
    const query = `
        SELECT hv.*, h.name as host_name, cb.name as brand_name
        FROM host_violations hv
        LEFT JOIN hosts h ON hv.host_id = h.id
        LEFT JOIN client_brands cb ON hv.brand_id = cb.id
        WHERE hv.host_id = ?
        ORDER BY hv.created_at DESC
      `;
    const params = [hostId];
    const columns = await queryMany(query, params);
    console.log(columns);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();

