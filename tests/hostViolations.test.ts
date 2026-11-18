import test from 'node:test';
import assert from 'node:assert/strict';

test('host violations filtering matches by host_id or host_name', () => {
  const activeHost = { id: 'h1', name: 'Siti Sarah', username: 'sitisarah' };

  const violations = [
    {
      id: 'v1',
      host_id: 'h1',
      host_name: 'Siti Sarah',
      violation_type: 'Terlambat Masuk Live',
      consequence: 'Teguran Lisan',
      violation_date: '2026-11-10',
    },
    {
      id: 'v2',
      host_id: 'h2',
      host_name: 'Budi Santoso',
      violation_type: 'Tidak Menyalakan Ring Light',
      consequence: 'Peringatan 1',
      violation_date: '2026-11-11',
    },
    {
      id: 'v3',
      host_id: 'unknown-id',
      host_name: 'siti sarah',
      violation_type: 'Meninggalkan Layar Tanpa Izin',
      consequence: 'Pengurangan Bonus',
      violation_date: '2026-11-12',
    },
  ];

  const filtered = violations.filter(
    (v) =>
      v.host_id === activeHost.id ||
      (v.host_name &&
        activeHost.name &&
        v.host_name.trim().toLowerCase() === activeHost.name.trim().toLowerCase())
  );

  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].id, 'v1');
  assert.equal(filtered[1].id, 'v3');
});

test('host violations sorting orders by violation_date or created_at descending', () => {
  const violations = [
    { id: 'v1', violation_date: '2026-11-01', created_at: '2026-11-01T10:00:00Z' },
    { id: 'v2', violation_date: '2026-11-15', created_at: '2026-11-15T10:00:00Z' },
    { id: 'v3', violation_date: '2026-11-08', created_at: '2026-11-08T10:00:00Z' },
  ];

  const sorted = violations.slice().sort((a, b) => {
    const dateA = a.violation_date || a.created_at || '';
    const dateB = b.violation_date || b.created_at || '';
    return dateB.localeCompare(dateA);
  });

  assert.equal(sorted[0].id, 'v2');
  assert.equal(sorted[1].id, 'v3');
  assert.equal(sorted[2].id, 'v1');
});
