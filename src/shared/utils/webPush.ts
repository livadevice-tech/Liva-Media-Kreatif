import { webPushApi } from '../../api';

/**
 * Mengonversi VAPID public key berformat Base64 URL-safe menjadi Uint8Array
 * yang dibutuhkan oleh W3C PushManager.subscribe().
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Mengecek apakah browser dan perangkat ini mendukung fitur Web Push Notification
 */
export function isWebPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Mendapatkan status izin notifikasi saat ini
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Mendapatkan subscription yang tersimpan di browser (jika ada)
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('Gagal membaca existing push subscription:', err);
    return null;
  }
}

/**
 * Mendaftarkan perangkat HP ke Push Manager browser & menyimpannya di backend MySQL.
 * Ini memungkinkan HP menerima notifikasi di layar kunci (lock screen) & drawer
 * meskipun aplikasi sedang ditutup / layar mati.
 */
export async function subscribeDeviceToPush(hostId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!isWebPushSupported()) {
    // Check if on iOS Safari not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isIOS && !isStandalone) {
      return {
        success: false,
        error: 'Di iPhone/iPad, silakan tambahkan aplikasi ke Layar Utama (Add to Home Screen) terlebih dahulu untuk mengaktifkan Push Notifikasi HP.',
      };
    }

    return {
      success: false,
      error: 'Browser atau perangkat ini belum mendukung fitur Web Push Notification.',
    };
  }

  try {
    // 1. Minta izin notifikasi browser jika belum diberikan
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Izin notifikasi ditolak oleh pengaturan browser atau HP. Silakan aktifkan izin notifikasi di setelan situs browser kamu.',
      };
    }

    // 2. Pastikan Service Worker sudah aktif
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return {
        success: false,
        error: 'Service Worker belum siap. Silakan muat ulang halaman.',
      };
    }

    // 3. Ambil VAPID Public Key dari server
    const { publicKey } = await webPushApi.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: 'Kunci VAPID tidak ditemukan di server.',
      };
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // 4. Periksa apakah sudah ada subscription atau buat baru
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 5. Kirim data subscription ke server MySQL
    const res = await webPushApi.subscribe({
      hostId,
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
    });

    return {
      success: true,
      message: res.message || 'Perangkat berhasil terhubung dengan notifikasi HP!',
    };
  } catch (err: any) {
    console.error('Error mendaftarkan Push Notifikasi:', err);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat mengaktifkan notifikasi HP.',
    };
  }
}

/**
 * Membatalkan langganan push notifikasi untuk perangkat ini
 */
export async function unsubscribeDeviceFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isWebPushSupported()) return { success: true };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await webPushApi.unsubscribe(endpoint);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error membatalkan Push Notifikasi:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Sinkronisasi otomatis: Jika user sudah memberikan izin notifikasi sebelumnya,
 * pastikan subscription tetap terdaftar dan terikat ke hostId saat ini.
 */
export async function syncPushSubscriptionIfGranted(hostId: string): Promise<boolean> {
  if (!isWebPushSupported() || Notification.permission !== 'granted' || !hostId) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const { publicKey } = await webPushApi.getPublicKey();
      if (!publicKey) return false;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    if (subscription) {
      await webPushApi.subscribe({
        hostId,
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      });
      return true;
    }
  } catch (err) {
    console.debug('Background push subscription sync skipped:', err);
  }

  return false;
}
