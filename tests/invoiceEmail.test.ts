import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInvoiceQuotationEmail,
  getPlatformNameFromDescription,
} from "../src/shared/utils/invoiceEmail";

test("getPlatformNameFromDescription maps known platforms and falls back safely", () => {
  assert.equal(getPlatformNameFromDescription("TikTok Live Package"), "TikTok");
  assert.equal(getPlatformNameFromDescription("Shopee Live Package"), "Shopee");
  assert.equal(getPlatformNameFromDescription("Other Package"), "[NAMA PLATFORM]");
});

test("buildInvoiceQuotationEmail creates a stable subject and body summary", () => {
  const email = buildInvoiceQuotationEmail({
    brandName: "Brand A",
    issueDate: "2026-07-01",
    dueDate: "2026-07-08",
    totalAmount: 15000000,
    sessionItems: [{ description: "TikTok Live Package", qty: 2 }],
    picName: "Rina",
    ptName: "PT Brand A",
    email: "rina@example.com",
  });

  assert.equal(email.to, "rina@example.com");
  assert.equal(email.subject, "Quotation for TikTok Livestream - Brand A");
  assert.match(email.body, /Dear Rina/);
  assert.match(email.body, /Period: 01\/07\/2026 - 08\/07\/2026/);
  assert.match(email.body, /Qty: 2 shift/);
  assert.match(email.body, /PT Brand A/);
});
