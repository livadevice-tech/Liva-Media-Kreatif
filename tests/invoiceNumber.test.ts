import assert from "node:assert/strict";
import test from "node:test";

import { buildNextInvoiceNumber } from "../src/shared/utils/invoiceNumber";

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
