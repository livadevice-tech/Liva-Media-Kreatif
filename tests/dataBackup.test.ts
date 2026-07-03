import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDatabaseBackupPayload,
  createBackupDownloadHref,
  extractBackupImportCollections,
  getBackupFilename,
  hasAnyBackupCollections,
  recoverCollectionsFromLocalStorage,
} from "../src/shared/utils/dataBackup";

test("buildDatabaseBackupPayload keeps the expected backup shape", () => {
  const payload = buildDatabaseBackupPayload({
    hosts: [{ id: "h1" }],
    logs: [{ id: "l1" }],
    clientBrands: [],
    clientLeads: [],
    schedules: [{ id: "s1" }],
    brands: [{ id: "b1" }],
    shifts: [],
    studios: [],
    platforms: [{ id: "p1" }],
  });

  assert.deepEqual(payload.hosts, [{ id: "h1" }]);
  assert.deepEqual(payload.platforms, [{ id: "p1" }]);
  assert.match(createBackupDownloadHref(payload), /^data:text\/json;charset=utf-8,/);
});

test("getBackupFilename returns a dated JSON filename", () => {
  assert.match(getBackupFilename(new Date("2026-07-03T00:00:00.000Z")), /liva_database_backup_2026-07-03\.json$/);
});

test("extractBackupImportCollections keeps known arrays and ignores invalid values", () => {
  const collections = extractBackupImportCollections({
    hosts: [{ id: "h1" }],
    logs: "not-an-array",
    clientBrands: [{ id: "cb1" }],
  });

  assert.ok(collections);
  assert.deepEqual(collections?.hosts, [{ id: "h1" }]);
  assert.deepEqual(collections?.clientBrands, [{ id: "cb1" }]);
  assert.equal(collections?.logs, undefined);
  assert.equal(hasAnyBackupCollections(collections ?? {}), true);
});

test("recoverCollectionsFromLocalStorage migrates arrays from storage", () => {
  const storage = new Map<string, string>([
    ["mcn_hosts", JSON.stringify([{ id: 1 }, { id: 2 }])],
    ["mcn_logs", JSON.stringify([])],
    ["mcn_client_brands", "not-json"],
    ["mcn_client_leads", JSON.stringify([{ id: 3 }])],
  ]);
  const syncCalls: Array<{ collectionName: string; next: unknown[] }> = [];
  const originalError = console.error;
  console.error = () => {};

  try {
    const total = recoverCollectionsFromLocalStorage(
      (collectionName, _current, next) => {
        syncCalls.push({ collectionName, next });
      },
      {
        getItem: (key: string) => storage.get(key) ?? null,
      } as Storage,
    );

    assert.equal(total, 3);
    assert.deepEqual(syncCalls, [
      { collectionName: "hosts", next: [{ id: 1 }, { id: 2 }] },
      { collectionName: "client_leads", next: [{ id: 3 }] },
    ]);
  } finally {
    console.error = originalError;
  }
});
