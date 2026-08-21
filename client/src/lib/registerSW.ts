export async function registerServiceWorker() {
  if (import.meta.env.DEV) {
    await unregisterServiceWorker();
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const reloadKey = 'multilingue-sw-version-reload';
      const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      };
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      await registration.update();
      console.log('✅ Service Worker registrado:', registration);

      // Novos bundles assumem o controle sem forçar a recarga da tela atual.
      // Isso preserva a rota e o estado de estudo; a próxima abertura já usa
      // naturalmente os recursos atualizados.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (window.sessionStorage.getItem(reloadKey) === '1') return;
        window.sessionStorage.setItem(reloadKey, '1');
      });
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            activateWaitingWorker(registration);
          }
        });
      });
      activateWaitingWorker(registration);

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
