type BackupCollectionName =
  | "hosts"
  | "logs"
  | "clientBrands"
  | "clientLeads"
  | "schedules"
  | "brands"
  | "shifts"
  | "studios"
  | "platforms";

export interface DatabaseBackupPayload {
  hosts: readonly unknown[];
  logs: readonly unknown[];
  clientBrands: readonly unknown[];
  clientLeads: readonly unknown[];
  schedules: readonly unknown[];
  brands: readonly unknown[];
  shifts: readonly unknown[];
  studios: readonly unknown[];
  platforms: readonly unknown[];
}

export interface BackupSourceCollections extends DatabaseBackupPayload {}

export interface BackupImportCandidate {
  hosts?: unknown;
  logs?: unknown;
  clientBrands?: unknown;
  clientLeads?: unknown;
  schedules?: unknown;
  brands?: unknown;
  shifts?: unknown;
  studios?: unknown;
  platforms?: unknown;
}

const BACKUP_COLLECTIONS: Array<{
  collectionName: string;
  localKey: string;
}> = [
  { collectionName: "hosts", localKey: "mcn_hosts" },
  { collectionName: "logs", localKey: "mcn_logs" },
  { collectionName: "client_brands", localKey: "mcn_client_brands" },
  { collectionName: "client_leads", localKey: "mcn_client_leads" },
];

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export function buildDatabaseBackupPayload(
  collections: BackupSourceCollections,
): DatabaseBackupPayload {
  return {
    hosts: collections.hosts,
    logs: collections.logs,
    clientBrands: collections.clientBrands,
    clientLeads: collections.clientLeads,
    schedules: collections.schedules,
    brands: collections.brands,
    shifts: collections.shifts,
    studios: collections.studios,
    platforms: collections.platforms,
  };
}

export function createBackupDownloadHref(payload: DatabaseBackupPayload) {
  return (
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(payload, null, 2))
  );
}

export function getBackupFilename(date = new Date()) {
  return `liva_database_backup_${date.toISOString().split("T")[0]}.json`;
}

export function recoverCollectionsFromLocalStorage(
  syncToFirestore: (collectionName: string, current: unknown[], next: unknown[]) => void,
  storage: Storage = localStorage,
) {
  let count = 0;

  for (const { collectionName, localKey } of BACKUP_COLLECTIONS) {
    try {
      const localData = storage.getItem(localKey);
      if (!localData) continue;

      const parsed = JSON.parse(localData);
      if (isArray(parsed) && parsed.length > 0) {
        syncToFirestore(collectionName, [], parsed);
        count += parsed.length;
      }
    } catch (error) {
      console.error("Migration error for", localKey, error);
    }
  }

  return count;
}

export function extractBackupImportCollections(
  parsed: BackupImportCandidate | null | undefined,
) {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const payload: Partial<Record<BackupCollectionName, unknown[]>> = {};
  const mapping: Array<[BackupCollectionName, keyof BackupImportCandidate]> = [
    ["hosts", "hosts"],
    ["logs", "logs"],
    ["clientBrands", "clientBrands"],
    ["clientLeads", "clientLeads"],
    ["schedules", "schedules"],
    ["brands", "brands"],
    ["shifts", "shifts"],
    ["studios", "studios"],
    ["platforms", "platforms"],
  ];

  for (const [targetKey, sourceKey] of mapping) {
    const value = parsed[sourceKey];
    if (isArray(value)) {
      payload[targetKey] = value;
    }
  }

  return payload;
}

export function hasAnyBackupCollections(
  parsed: Partial<Record<BackupCollectionName, unknown[]>>,
) {
  return Object.values(parsed).some((value) => Array.isArray(value));
}
