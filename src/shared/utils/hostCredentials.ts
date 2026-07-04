const HOST_STUDIO_LOCATIONS = ["Bandar Lampung", "Tanggamus"] as const;

export type HostStudioLocation = (typeof HOST_STUDIO_LOCATIONS)[number];

export function normalizeHostStudioLocation(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const compact = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (compact.includes("tanggamus")) return "Tanggamus";
  if (compact.includes("bandar lampung")) return "Bandar Lampung";

  return trimmed.replace(/^Studio\s+/i, "");
}

export function getHostStudioOptions(): HostStudioLocation[] {
  return [...HOST_STUDIO_LOCATIONS];
}

export function hasHostPasswordValue(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveHostPasswordHash(
  candidatePassword: string | null | undefined,
  existingPasswordHash: string | null | undefined,
  hashPassword: (password: string) => string,
): string | null {
  if (hasHostPasswordValue(candidatePassword)) {
    return hashPassword(candidatePassword.trim());
  }

  return existingPasswordHash || null;
}
