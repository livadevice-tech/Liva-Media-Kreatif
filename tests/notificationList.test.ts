import assert from "node:assert/strict";
import test from "node:test";

import {
  markAllAsRead,
  markHostNotificationsAsRead,
  prependCappedNotification,
  removeNotification,
} from "../src/shared/utils/notificationList";

test("prependCappedNotification keeps newest items and respects the cap", () => {
  const result = prependCappedNotification(
    [
      { id: "2", read: false },
      { id: "3", read: true },
    ],
    { id: "1", read: false },
    2,
  );

  assert.deepEqual(result, [
    { id: "1", read: false },
    { id: "2", read: false },
  ]);
});

test("markAllAsRead sets every notification to read", () => {
  assert.deepEqual(
    markAllAsRead([
      { id: "1", read: false },
      { id: "2", read: true },
    ]),
    [
      { id: "1", read: true },
      { id: "2", read: true },
    ],
  );
});

test("removeNotification and markHostNotificationsAsRead work predictably", () => {
  const list = [
    { id: "1", hostId: "a", read: false },
    { id: "2", hostId: "b", read: false },
  ];

  assert.deepEqual(removeNotification(list, "1"), [
    { id: "2", hostId: "b", read: false },
  ]);

  assert.deepEqual(markHostNotificationsAsRead(list, "a"), [
    { id: "1", hostId: "a", read: true },
    { id: "2", hostId: "b", read: false },
  ]);
});
