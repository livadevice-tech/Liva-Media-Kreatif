import assert from "node:assert/strict";
import test from "node:test";

import { validateProductionConfig } from "../server/productionConfig";

const validEnv = {
  NODE_ENV: "production",
  SESSION_SECRET: "0123456789abcdef0123456789abcdef",
  ADMIN_USERNAME: "master",
  ADMIN_PASSWORD: "change-this-password",
  DB_HOST: "127.0.0.1",
  DB_USER: "app_user",
  DB_PASS: "app_password",
  DB_NAME: "app_db",
  ALLOWED_ORIGINS: "https://app.example.com,https://admin.example.com",
};

test("production config validation allows a complete production env", () => {
  assert.deepEqual(validateProductionConfig(validEnv), []);
});

test("production config validation rejects missing and placeholder secrets", () => {
  const errors = validateProductionConfig({
    NODE_ENV: "production",
    SESSION_SECRET: "short",
    ADMIN_USERNAME: "",
    ADMIN_PASSWORD: "CHANGE_THIS",
    DB_HOST: "",
    DB_USER: "YOUR_DB_USER",
    DB_PASS: "",
    DB_NAME: "",
    ALLOWED_ORIGINS: "http://localhost:3000,*",
  });

  assert.deepEqual(errors, [
    "SESSION_SECRET harus minimal 32 karakter dan bukan placeholder.",
    "ADMIN_USERNAME harus diisi.",
    "ADMIN_PASSWORD atau ADMIN_PASSWORD_HASH harus diisi dan bukan placeholder.",
    "DB_HOST harus diisi dan bukan placeholder.",
    "DB_USER harus diisi dan bukan placeholder.",
    "DB_PASS harus diisi dan bukan placeholder.",
    "DB_NAME harus diisi dan bukan placeholder.",
    "ALLOWED_ORIGINS harus berisi daftar origin HTTPS yang valid dan bukan wildcard.",
  ]);
});

test("development mode skips production validation", () => {
  assert.deepEqual(
    validateProductionConfig({
      NODE_ENV: "development",
      SESSION_SECRET: "",
      ADMIN_USERNAME: "",
    }),
    [],
  );
});
