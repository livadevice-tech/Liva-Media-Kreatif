import assert from "node:assert/strict";
import test from "node:test";
import { HostScheduleRequest, HostRequestStatus, HostRequestType } from "../src/types";

test("HostScheduleRequest type validation and status filtering", () => {
  const requests: HostScheduleRequest[] = [
    {
      id: "req-1",
      host_id: "host-1",
      host_name: "Alice",
      request_type: "izin",
      start_date: "2026-11-01",
      reason_category: "Sakit",
      reason_description: "Demam dan flu",
      status: "pending",
      created_at: "2026-10-31T08:00:00Z",
    },
    {
      id: "req-2",
      host_id: "host-2",
      host_name: "Bob",
      request_type: "tukar_jadwal",
      original_date: "2026-11-02",
      original_shift: "Shift 1 (08:00 - 12:00)",
      target_date: "2026-11-03",
      target_shift: "Shift 2 (13:00 - 17:00)",
      status: "in_review",
      created_at: "2026-10-31T09:00:00Z",
    },
    {
      id: "req-3",
      host_id: "host-1",
      host_name: "Alice",
      request_type: "izin",
      start_date: "2026-10-25",
      reason_category: "Cuti / Keperluan Pribadi",
      status: "approved",
      reviewed_by: "Admin",
      reviewed_at: "2026-10-26T10:00:00Z",
      created_at: "2026-10-25T07:00:00Z",
    },
    {
      id: "req-4",
      host_id: "host-3",
      host_name: "Charlie",
      request_type: "tukar_jadwal",
      original_date: "2026-11-04",
      target_date: "2026-11-05",
      status: "rejected",
      admin_notes: "Tidak ada host pengganti yang tersedia",
      created_at: "2026-10-31T10:00:00Z",
    },
  ];

  // Filtering by status
  const pendingRequests = requests.filter((r) => r.status === "pending");
  assert.equal(pendingRequests.length, 1);
  assert.equal(pendingRequests[0].id, "req-1");

  const inReviewRequests = requests.filter((r) => r.status === "in_review");
  assert.equal(inReviewRequests.length, 1);
  assert.equal(inReviewRequests[0].id, "req-2");

  const approvedRequests = requests.filter((r) => r.status === "approved");
  assert.equal(approvedRequests.length, 1);

  const rejectedRequests = requests.filter((r) => r.status === "rejected");
  assert.equal(rejectedRequests.length, 1);
  assert.equal(rejectedRequests[0].admin_notes, "Tidak ada host pengganti yang tersedia");

  // Filtering by host_id
  const aliceRequests = requests.filter((r) => r.host_id === "host-1");
  assert.equal(aliceRequests.length, 2);

  // Filtering by request_type
  const leaveRequests = requests.filter((r) => r.request_type === "izin");
  assert.equal(leaveRequests.length, 2);

  const swapRequests = requests.filter((r) => r.request_type === "tukar_jadwal");
  assert.equal(swapRequests.length, 2);
});
