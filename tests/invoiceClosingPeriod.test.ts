import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInvoiceClosingPeriod,
  isDateInInvoiceClosingPeriod,
  determineClosingMonthForDate,
  getAvailableClosingMonths,
  getInvoiceBenchmarkDate,
} from '../src/shared/utils/invoiceClosingPeriod';

test('getInvoiceBenchmarkDate uses dueDate as the primary benchmark', () => {
  // Invoice with dueDate should use dueDate
  const invWithDueDate = {
    dueDate: '2026-11-10',
    issueDate: '2026-10-20',
    invoiceDate: '2026-10-20',
  };
  assert.equal(getInvoiceBenchmarkDate(invWithDueDate), '2026-11-10');

  // Invoice with ISO dueDate string
  const invWithIsoDueDate = {
    dueDate: '2026-11-10T15:30:00.000Z',
    issueDate: '2026-10-20',
  };
  assert.equal(getInvoiceBenchmarkDate(invWithIsoDueDate), '2026-11-10');

  // Invoice without dueDate falls back to invoiceDate or issueDate
  const invWithoutDueDate = {
    dueDate: '',
    invoiceDate: '2026-10-25',
    issueDate: '2026-10-20',
  };
  assert.equal(getInvoiceBenchmarkDate(invWithoutDueDate), '2026-10-25');

  const invOnlyIssueDate = {
    dueDate: null,
    issueDate: '2026-10-18',
  };
  assert.equal(getInvoiceBenchmarkDate(invOnlyIssueDate), '2026-10-18');
});

test('isDateInInvoiceClosingPeriod accurately places invoices by Due Date', () => {
  const closingDay = 25;

  // Tutup Buku November 2026: 26 Oktober 2026 s.d. 25 November 2026
  const periodNov = getInvoiceClosingPeriod('2026-11', closingDay);
  assert.equal(periodNov.startDate, '2026-10-26');
  assert.equal(periodNov.endDate, '2026-11-25');

  // Case 1: Invoice issued Oct 15, but Due Date is Oct 28
  // Under Due Date benchmark, it MUST enter November 2026 cutoff (26 Okt - 25 Nov)
  const inv1 = {
    issueDate: '2026-10-15',
    dueDate: '2026-10-28',
  };
  const benchmark1 = getInvoiceBenchmarkDate(inv1);
  assert.equal(isDateInInvoiceClosingPeriod(benchmark1, '2026-11', closingDay), true);
  assert.equal(isDateInInvoiceClosingPeriod(benchmark1, '2026-10', closingDay), false);

  // Case 2: Invoice issued Oct 10, Due Date is Oct 24
  // Enters Oktober 2026 cutoff (26 Sep - 25 Okt)
  const inv2 = {
    issueDate: '2026-10-10',
    dueDate: '2026-10-24',
  };
  const benchmark2 = getInvoiceBenchmarkDate(inv2);
  assert.equal(isDateInInvoiceClosingPeriod(benchmark2, '2026-10', closingDay), true);
  assert.equal(isDateInInvoiceClosingPeriod(benchmark2, '2026-11', closingDay), false);

  // Case 3: Due date exactly on cutoff day (25 November)
  // Belongs to November 2026
  assert.equal(isDateInInvoiceClosingPeriod('2026-11-25', '2026-11', closingDay), true);

  // Case 4: Due date on the day after cutoff (26 November)
  // Belongs to Desember 2026 (26 Nov - 25 Des)
  assert.equal(isDateInInvoiceClosingPeriod('2026-11-26', '2026-11', closingDay), false);
  assert.equal(isDateInInvoiceClosingPeriod('2026-11-26', '2026-12', closingDay), true);
});

test('determineClosingMonthForDate returns proper closing month based on closingDay', () => {
  // Day <= 25 belongs to same month
  assert.equal(determineClosingMonthForDate(new Date(2026, 9, 25), 25), '2026-10'); // Oct 25 -> 2026-10
  // Day > 25 belongs to next month
  assert.equal(determineClosingMonthForDate(new Date(2026, 9, 26), 25), '2026-11'); // Oct 26 -> 2026-11
});
