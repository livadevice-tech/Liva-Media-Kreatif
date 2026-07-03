import dotenv from "dotenv";

import { validateProductionConfig } from "../server/productionConfig";

dotenv.config();

const errors = validateProductionConfig({
  ...process.env,
  NODE_ENV: "production",
});

if (errors.length > 0) {
  console.error("Preflight gagal. Perbaiki konfigurasi production berikut:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Preflight lulus.");
