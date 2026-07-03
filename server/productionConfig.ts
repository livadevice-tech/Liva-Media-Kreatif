type EnvMap = Record<string, string | undefined>;

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  return (
    normalized === "change_this" ||
    normalized === "change-this" ||
    normalized === "change_me" ||
    normalized === "change-me" ||
    normalized === "todo" ||
    normalized === "your_db_user" ||
    normalized === "your_db_pass" ||
    normalized === "your_db_name" ||
    normalized === "your_session_secret" ||
    normalized === "development-session-secret-change-before-production" ||
    normalized === "my_gemini_api_key" ||
    normalized.startsWith("your_") ||
    normalized.startsWith("change_this")
  );
}

function isValidHttpsOrigin(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" && url.origin === raw.trim();
  } catch {
    return false;
  }
}

export function validateProductionConfig(env: EnvMap): string[] {
  if (env.NODE_ENV !== "production") return [];

  const errors: string[] = [];

  const sessionSecret = env.SESSION_SECRET?.trim() || "";
  if (sessionSecret.length < 32 || isPlaceholder(sessionSecret)) {
    errors.push("SESSION_SECRET harus minimal 32 karakter dan bukan placeholder.");
  }

  const adminUsername = env.ADMIN_USERNAME?.trim() || "";
  if (!adminUsername || isPlaceholder(adminUsername)) {
    errors.push("ADMIN_USERNAME harus diisi.");
  }

  const adminPassword = env.ADMIN_PASSWORD?.trim() || "";
  const adminPasswordHash = env.ADMIN_PASSWORD_HASH?.trim() || "";
  const hasAdminPassword = !!adminPassword && !isPlaceholder(adminPassword);
  const hasAdminPasswordHash = !!adminPasswordHash && !isPlaceholder(adminPasswordHash);
  if (!hasAdminPassword && !hasAdminPasswordHash) {
    errors.push("ADMIN_PASSWORD atau ADMIN_PASSWORD_HASH harus diisi dan bukan placeholder.");
  }

  for (const key of ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"] as const) {
    const value = env[key]?.trim() || "";
    if (!value || isPlaceholder(value)) {
      errors.push(`${key} harus diisi dan bukan placeholder.`);
    }
  }

  const origins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const hasInvalidOrigin = origins.length === 0 || origins.some((origin) =>
    origin === "*" || !isValidHttpsOrigin(origin),
  );
  if (hasInvalidOrigin) {
    errors.push("ALLOWED_ORIGINS harus berisi daftar origin HTTPS yang valid dan bukan wildcard.");
  }

  return errors;
}
