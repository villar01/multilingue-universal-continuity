export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('✅ Service Worker registrado:', registration);

      // Escutar mensagens do SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_OFFLINE_DATA') {
          console.log('🔄 Sincronizando dados offline...');
          // Disparar evento customizado para o app
          window.dispatchEvent(new CustomEvent('offline-sync-requested'));
        }
      });

      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('✅ Service Worker desregistrado');
  }
}

export async function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('sync-offline-data');
      console.log('✅ Background sync solicitado');
    } catch (error) {
      console.error('❌ Erro ao solicitar background sync:', error);
    }
  }
}
