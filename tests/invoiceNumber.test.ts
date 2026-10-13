import assert from "node:assert/strict";
import test from "node:test";

import { buildNextInvoiceNumber, generateSignedInvoiceFileName } from "../src/shared/utils/invoiceNumber";

test("buildNextInvoiceNumber increments the current month sequence", () => {
  const invoiceNumber = buildNextInvoiceNumber(
    [
      {
        id: "brand-1",
        name: "Brand A",
        sessions: [],
        contractEndDate: "",
        invoiceDate: "",
        accounts: [],
        monthlyMeetingDate: "",
        invoices: [
          {
            id: "inv-1",
            invoiceNumber: "INV/001/LIVA/VII/2026",
            issueDate: "2026-07-01",
            dueDate: "2026-07-08",
            status: "Draft",
            recipientName: "PIC",
            email: "",
            address: "",
            totalAmount: 0,
            sessionItems: [],
          },
        ],
      },
    ],
    new Date("2026-07-03T00:00:00Z"),
  );

  assert.equal(invoiceNumber, "INV/002/LIVA/VII/2026");
});

test("buildNextInvoiceNumber resets across different months", () => {
  const invoiceNumber = buildNextInvoiceNumber(
    [
      {
        id: "brand-1",
        name: "Brand A",
        sessions: [],
        contractEndDate: "",
        invoiceDate: "",
        accounts: [],
        monthlyMeetingDate: "",
        invoices: [
          {
            id: "inv-1",
            invoiceNumber: "INV/009/LIVA/VI/2026",
            issueDate: "2026-06-30",
            dueDate: "2026-07-07",
            status: "Draft",
            recipientName: "PIC",
            email: "",
            address: "",
            totalAmount: 0,
            sessionItems: [],
          },
        ],
      },
    ],
    new Date("2026-07-03T00:00:00Z"),
  );

  assert.equal(invoiceNumber, "INV/001/LIVA/VII/2026");
});

test("generateSignedInvoiceFileName matches signed_<15_digits>_<13_hex>_<4-4-4-4-4-4-3_hex> pattern and is unique", () => {
  const pattern = /^signed_\d{15}_[0-9a-f]{13}_[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{3}$/;

  const generated = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const fileName = generateSignedInvoiceFileName();
    assert.match(fileName, pattern);
    assert.equal(generated.has(fileName), false, `Collision found: ${fileName}`);
    generated.add(fileName);
  }

  assert.equal(generated.size, 50);
});

