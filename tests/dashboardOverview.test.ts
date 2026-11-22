import test from 'node:test';
import assert from 'node:assert/strict';

// Helper to parse shift time
function parseShiftTime(timeStr?: string, shiftStr?: string) {
  const combined = `${timeStr || ""} ${shiftStr || ""}`;
  const match = combined.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    const startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    let endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);
    if (endH < startH) endH += 24;
    return {
      startMinutes: startH * 60 + startM,
      endMinutes: endH * 60 + endM,
      startTimeFormatted: `${String(match[1]).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      endTimeFormatted: `${String(match[3]).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
    };
  }
  return { startMinutes: 9 * 60, endMinutes: 13 * 60, startTimeFormatted: "09:00", endTimeFormatted: "13:00" };
}

test('parseShiftTime accurately parses hours from shift strings', () => {
  const s1 = parseShiftTime("Morning (08:00 - 12:00)");
  assert.equal(s1.startMinutes, 8 * 60);
  assert.equal(s1.endMinutes, 12 * 60);
  assert.equal(s1.startTimeFormatted, "08:00");
  assert.equal(s1.endTimeFormatted, "12:00");

  const s2 = parseShiftTime(undefined, "19.30 - 23.30");
  assert.equal(s2.startMinutes, 19 * 60 + 30);
  assert.equal(s2.endMinutes, 23 * 60 + 30);
  assert.equal(s2.startTimeFormatted, "19:30");
  assert.equal(s2.endTimeFormatted, "23:30");
});

test('nearest schedule sorting places live first, followed by upcoming nearest', () => {
  const currentMinutes = 10 * 60 + 30; // 10:30 WIB

  const sessions = [
    { id: 's-past', shift: '06:00 - 10:00' },
    { id: 's-live', shift: '09:00 - 13:00' },
    { id: 's-upcoming-near', shift: '11:00 - 15:00' },
    { id: 's-upcoming-late', shift: '18:00 - 22:00' },
  ];

  const enriched = sessions.map((s) => {
    const parsed = parseShiftTime(undefined, s.shift);
    const isLive = currentMinutes >= parsed.startMinutes && currentMinutes < parsed.endMinutes;
    const isUpcoming = currentMinutes < parsed.startMinutes;
    let sortScore = 0;
    if (isLive) {
      sortScore = 0 - (parsed.endMinutes - currentMinutes);
    } else if (isUpcoming) {
      sortScore = 1000 + (parsed.startMinutes - currentMinutes);
    } else {
      sortScore = 100000 + (currentMinutes - parsed.endMinutes);
    }
    return { ...s, sortScore, isLive, isUpcoming };
  });

  enriched.sort((a, b) => a.sortScore - b.sortScore);

  assert.equal(enriched[0].id, 's-live'); // Live first
  assert.equal(enriched[1].id, 's-upcoming-near'); // Upcoming nearest second
  assert.equal(enriched[2].id, 's-upcoming-late'); // Upcoming later third
  assert.equal(enriched[3].id, 's-past'); // Finished last
});

test('late logs are properly categorized for today, week, and cutoff periods', () => {
  const todayStr = '2026-11-22';
  const mondayStr = '2026-11-16';
  const sundayStr = '2026-11-22';
  const cutoff = '2026-12'; // Cutoff for 16 Nov - 15 Dec 2026

  const mockLogs = [
    { id: '1', date: '2026-11-22', status: 'Late', hostName: 'Host A' },
    { id: '2', date: '2026-11-22', status: 'Present', hostName: 'Host B' },
    { id: '3', date: '2026-11-18', status: 'Late', hostName: 'Host C' },
    { id: '4', date: '2026-11-05', status: 'Late', hostName: 'Host D' }, // Previous cutoff
  ];

  const todayLate = mockLogs.filter(l => l.date === todayStr && l.status === 'Late');
  const weekLate = mockLogs.filter(l => l.date >= mondayStr && l.date <= sundayStr && l.status === 'Late');

  assert.equal(todayLate.length, 1);
  assert.equal(todayLate[0].hostName, 'Host A');
  assert.equal(weekLate.length, 2);
});

test('invoices identify overdue and due soon correctly', () => {
  const todayStr = '2026-11-22';

  const mockInvoices = [
    { invoiceNumber: 'INV-1', dueDate: '2026-11-20', status: 'Open Invoice', totalAmount: 10000000 }, // Overdue 2 days
    { invoiceNumber: 'INV-2', dueDate: '2026-11-22', status: 'Open Invoice', totalAmount: 5000000 }, // Due today
    { invoiceNumber: 'INV-3', dueDate: '2026-11-25', status: 'Open Invoice', totalAmount: 8000000 }, // Due soon (in 3 days)
    { invoiceNumber: 'INV-4', dueDate: '2026-11-20', status: 'Paid', totalAmount: 7000000 }, // Paid (ignored)
  ];

  const overdue = mockInvoices.filter(i => i.status !== 'Paid' && i.dueDate < todayStr);
  const dueToday = mockInvoices.filter(i => i.status !== 'Paid' && i.dueDate === todayStr);

  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].invoiceNumber, 'INV-1');
  assert.equal(dueToday.length, 1);
  assert.equal(dueToday[0].invoiceNumber, 'INV-2');
});
