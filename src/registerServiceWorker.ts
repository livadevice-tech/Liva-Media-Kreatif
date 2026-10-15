export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || import.meta.env.DEV) {
    return;
  }

  // Reload page when new service worker takes control so user immediately gets fresh assets
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing && !sessionStorage.getItem('pwa_refreshed_for_update')) {
      refreshing = true;
      sessionStorage.setItem('pwa_refreshed_for_update', '1');
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Liva PWA Service Worker terdaftar dengan scope:', registration.scope);

        // Immediately check if a newer worker exists on server
        registration.update().catch(() => {});

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Versi baru Liva Agency PWA tersedia.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ PWA Service Worker gagal terdaftar:', error);
      });
  });
}
