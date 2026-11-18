import test from 'node:test';
import assert from 'node:assert/strict';

type AttendanceItem = {
  id: string;
  hostId: string;
  hostName: string;
  date: string;
  shiftHours: string;
  brandHandled: string;
  platform: string;
  checkInTime?: string;
  proofUrl?: string;
  proofImage?: string;
};

function normalizeShiftStr(s?: string) {
  return (s || '').replace(/[:.]/g, ':').replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeStr(s?: string) {
  return (s || '').trim().toLowerCase();
}

function normalizeDateStr(d?: string) {
  if (!d) return '';
  return d.includes('T') ? d.split('T')[0] : d.split(' ')[0];
}

function checkAlreadySubmitted(
  existingLogs: AttendanceItem[],
  newSubmission: {
    hostId: string;
    hostName: string;
    employeeId?: string;
    date: string;
    shiftHours: string;
    brandHandled: string;
    platform: string;
  }
) {
  const match = existingLogs.find((log) => {
    const matchHost =
      (log.hostId && log.hostId === newSubmission.hostId) ||
      (log.hostName && newSubmission.hostName && normalizeStr(log.hostName) === normalizeStr(newSubmission.hostName));

    const matchDate = normalizeDateStr(log.date) === normalizeDateStr(newSubmission.date);
    const matchShift = normalizeShiftStr(log.shiftHours) === normalizeShiftStr(newSubmission.shiftHours);
    const matchBrand = normalizeStr(log.brandHandled) === normalizeStr(newSubmission.brandHandled);
    const matchPlatform = normalizeStr(log.platform) === normalizeStr(newSubmission.platform);

    return matchHost && matchDate && matchShift && matchBrand && matchPlatform;
  });

  if (match) {
    const timeInfo = match.checkInTime ? ` pukul ${match.checkInTime}` : '';
    return {
      alreadyCheckedIn: true,
      message: `Anda sudah absen! Data kehadiran untuk ${newSubmission.hostName} dengan shift ${newSubmission.shiftHours}, brand ${newSubmission.brandHandled}, dan platform ${newSubmission.platform} pada hari ini sudah tercatat${timeInfo}.`,
      logId: match.id,
    };
  }

  return { alreadyCheckedIn: false };
}

function deduplicateLogs(logs: AttendanceItem[]): AttendanceItem[] {
  const seen = new Set<string>();
  const uniqueList: AttendanceItem[] = [];

  const sorted = [...logs].sort((a, b) => {
    const aPhoto = a.proofUrl || a.proofImage ? 1 : 0;
    const bPhoto = b.proofUrl || b.proofImage ? 1 : 0;
    if (aPhoto !== bPhoto) return bPhoto - aPhoto;
    return (a.checkInTime || '').localeCompare(b.checkInTime || '');
  });

  for (const item of sorted) {
    const hName = normalizeStr(item.hostName || item.hostId || '');
    const dStr = normalizeDateStr(item.date);
    const sStr = normalizeShiftStr(item.shiftHours);
    const bStr = normalizeStr(item.brandHandled);
    const pStr = normalizeStr(item.platform);

    if (hName && dStr && sStr && bStr && pStr) {
      const key = `${hName}|${dStr}|${sStr}|${bStr}|${pStr}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    uniqueList.push(item);
  }

  return uniqueList;
}

test('detects duplicate attendance submission when all 5 fields match', () => {
  const existingLogs: AttendanceItem[] = [
    {
      id: 'log-1',
      hostId: 'h1',
      hostName: 'Gesti Apriani',
      date: '2026-11-17',
      shiftHours: 'Reg 3 (17.00-23.00)',
      brandHandled: 'Madu Uray',
      platform: 'Shopee Live',
      checkInTime: '10:19:14',
    },
  ];

  // Identical submission
  const res = checkAlreadySubmitted(existingLogs, {
    hostId: 'h1',
    hostName: 'Gesti Apriani',
    date: '2026-11-17',
    shiftHours: 'Reg 3 (17:00-23:00)', // variation with colon
    brandHandled: 'Madu Uray',
    platform: 'Shopee Live',
  });

  assert.strictEqual(res.alreadyCheckedIn, true);
  assert.match(res.message || '', /Anda sudah absen!/);
  assert.strictEqual(res.logId, 'log-1');
});

test('allows submission when any field differs (different shift or date or brand)', () => {
  const existingLogs: AttendanceItem[] = [
    {
      id: 'log-1',
      hostId: 'h1',
      hostName: 'Gesti Apriani',
      date: '2026-11-17',
      shiftHours: 'Reg 2 (11.00-17.00)',
      brandHandled: 'Madu Uray',
      platform: 'Shopee Live',
    },
  ];

  // Different shift on same day
  const res = checkAlreadySubmitted(existingLogs, {
    hostId: 'h1',
    hostName: 'Gesti Apriani',
    date: '2026-11-17',
    shiftHours: 'Reg 3 (17.00-23.00)',
    brandHandled: 'Madu Uray',
    platform: 'Shopee Live',
  });

  assert.strictEqual(res.alreadyCheckedIn, false);
});

test('deduplicates multiple duplicate attendance logs keeping only one', () => {
  const rawLogs: AttendanceItem[] = [
    {
      id: 'log-1',
      hostId: 'h1',
      hostName: 'Gesti Apriani',
      date: '2026-11-17',
      shiftHours: 'Reg 3 (17.00-23.00)',
      brandHandled: 'Madu Uray',
      platform: 'Shopee Live',
      checkInTime: '10:19:14',
      proofUrl: '/uploads/attendance/photo1.jpg',
    },
    {
      id: 'log-2',
      hostId: 'h1',
      hostName: 'Gesti Apriani',
      date: '2026-11-17',
      shiftHours: 'Reg 3 (17.00-23.00)',
      brandHandled: 'Madu Uray',
      platform: 'Shopee Live',
      checkInTime: '10:19:25',
      proofUrl: '/uploads/attendance/photo2.jpg',
    },
    {
      id: 'log-3',
      hostId: 'h1',
      hostName: 'Gesti Apriani',
      date: '2026-11-17',
      shiftHours: 'Reg 3 (17.00-23.00)',
      brandHandled: 'Madu Uray',
      platform: 'Shopee Live',
      checkInTime: '10:19:26',
    },
    {
      id: 'log-4',
      hostId: 'h2',
      hostName: 'Shela Okta Rhamadhini',
      date: '2026-11-16',
      shiftHours: 'Reg 3 (17.00-23.00)',
      brandHandled: 'Madu Uray',
      platform: 'TikTok Live',
      checkInTime: '16:15:32',
    },
  ];

  const deduped = deduplicateLogs(rawLogs);
  assert.strictEqual(deduped.length, 2);
  assert.strictEqual(deduped[0].id, 'log-1'); // Keep first one with photo & earliest checkInTime
  assert.strictEqual(deduped[1].id, 'log-4'); // Shela
});

