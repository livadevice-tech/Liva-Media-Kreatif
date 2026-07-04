export interface NotificationLike {
  id: string;
  read: boolean;
}

export function prependCappedNotification<T extends NotificationLike>(
  list: readonly T[],
  notification: T,
  maxItems: number,
) {
  return [notification, ...list].slice(0, maxItems);
}

export function markAllAsRead<T extends NotificationLike>(list: readonly T[]) {
  return list.map((item) => ({ ...item, read: true }));
}

export function removeNotification<T extends NotificationLike>(
  list: readonly T[],
  id: string,
) {
  return list.filter((item) => item.id !== id);
}

export function markHostNotificationsAsRead<T extends NotificationLike & { hostId: string }>(
  list: readonly T[],
  hostId: string,
) {
  return list.map((item) =>
    item.hostId === hostId ? { ...item, read: true } : item,
  );
}
