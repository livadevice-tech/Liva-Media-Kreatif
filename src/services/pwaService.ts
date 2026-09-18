import { appApi } from './appApi';

// Helper: Convert urlBase64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.warn('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

export async function getNotificationPermissionState(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestAndSubscribePushNotification(userId?: string, userRole?: string): Promise<{
  success: boolean;
  message: string;
  subscription?: PushSubscription;
}> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return {
      success: false,
      message: 'Perangkat atau browser ini tidak mendukung Web Push Notifications.'
    };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Izin notifikasi ditolak oleh pengguna atau sistem.'
      };
    }

    // 2. Ensure Service Worker is ready
    const registration = await navigator.serviceWorker.ready;

    // 3. Get VAPID Public Key from server
    const { publicKey } = await appApi.getVapidPublicKey();
    if (!publicKey) {
      return {
        success: false,
        message: 'Gagal mengambil kunci otorisasi VAPID dari server.'
      };
    }

    // 4. Subscribe user to push manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // 5. Send subscription to MySQL backend
    await appApi.subscribePushNotification({
      subscription,
      user_id: userId,
      user_role: userRole,
      device_info: `${navigator.userAgent} (${window.innerWidth}x${window.innerHeight})`,
    });

    return {
      success: true,
      message: 'Notifikasi HP berhasil diaktifkan!',
      subscription,
    };
  } catch (error: any) {
    console.error('[PWA Push Error]:', error);
    return {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.'
    };
  }
}
