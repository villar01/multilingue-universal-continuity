/**
 * MultiLingue Universal — Service Worker v8
 * Cache agressivo: Shell, Estático, API, Áudio, Imagens
 */
const CACHE_VERSION = 'v8';
const SHELL_CACHE = `multilingue-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `multilingue-static-${CACHE_VERSION}`;
const API_CACHE = `multilingue-api-${CACHE_VERSION}`;
const AUDIO_CACHE = `multilingue-audio-${CACHE_VERSION}`;
const IMAGE_CACHE = `multilingue-images-${CACHE_VERSION}`;
const CACHE_NAME = SHELL_CACHE; // compatibilidade
const urlsToCache = ['/', '/manifest.json'];

function isExpired(response, maxAgeSec) {
  if (!response) return true;
  const ts = response.headers.get('sw-cached-at');
  if (!ts) return false;
  return (Date.now() - parseInt(ts)) > maxAgeSec * 1000;
}
async function cacheWith(cacheName, req, res) {
  const cache = await caches.open(cacheName);
  const h = new Headers(res.headers);
  h.set('sw-cached-at', Date.now().toString());
  const r = new Response(await res.clone().blob(), { status: res.status, statusText: res.statusText, headers: h });
  cache.put(req, r);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(urlsToCache)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const VALID = [SHELL_CACHE, STATIC_CACHE, API_CACHE, AUDIO_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !VALID.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// A página solicita esta ativação quando uma versão publicada já foi baixada.
// A nova cena assume sem depender de uma reabertura manual do navegador.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;

  // As mídias do projeto redirecionam para URLs assinadas de curta duração.
  // O navegador precisa seguir esse redirecionamento diretamente; colocá-lo
  // no cache de imagens pode converter uma falha transitória em resposta 503.
  if (url.pathname.startsWith('/manus-storage/')) return;

  // Áudio TTS — Cache First 7 dias
  if (url.pathname.match(/\.(mp3|wav|ogg|m4a|webm)$/) || url.pathname.includes('/audio/')) {
    event.respondWith(caches.open(AUDIO_CACHE).then(async (c) => {
      const hit = await c.match(request);
      if (hit && !isExpired(hit, 604800)) return hit;
      try { const r = await fetch(request); if (r.ok) cacheWith(AUDIO_CACHE, request, r.clone()); return r; }
      catch { return hit || new Response('', { status: 503 }); }
    })); return;
  }

  // Imagens — Cache First 30 dias
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/)) {
    event.respondWith(caches.open(IMAGE_CACHE).then(async (c) => {
      const hit = await c.match(request);
      if (hit && !isExpired(hit, 2592000)) return hit;
      try { const r = await fetch(request); if (r.ok) cacheWith(IMAGE_CACHE, request, r.clone()); return r; }
      catch { return hit || new Response('', { status: 503 }); }
    })); return;
  }

  // Fontes — Cache First permanente
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(caches.open(STATIC_CACHE).then(async (c) => {
      const hit = await c.match(request);
      if (hit) return hit;
      const r = await fetch(request);
      if (r.ok) c.put(request, r.clone());
      return r;
    })); return;
  }

  // Assets estáticos com hash — Cache First permanente
  if (url.pathname.match(/\.(js|css|woff2?)$/) && url.pathname.includes('/assets/')) {
    event.respondWith(caches.open(STATIC_CACHE).then(async (c) => {
      const hit = await c.match(request);
      if (hit) return hit;
      const r = await fetch(request);
      if (r.ok) c.put(request, r.clone());
      return r;
    })); return;
  }

  // tRPC entrega autorização, currículo e voz por sessão. Nunca servir uma
  // resposta anterior aqui: dados obsoletos podem fechar o diálogo da cena.
  if (url.pathname.startsWith('/api/trpc')) return;

  // Outras APIs — Network only
  if (url.pathname.startsWith('/api/')) return;

  // Navegação SPA — Shell first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((r) => { if (r.ok) caches.open(SHELL_CACHE).then((c) => c.put(request, r.clone())); return r; })
        .catch(() => caches.match('/') || caches.match(request))
    ); return;
  }

  // Default — Network First
  event.respondWith(
    fetch(request).then((r) => { if (r.ok) caches.open(STATIC_CACHE).then((c) => c.put(request, r.clone())); return r; })
      .catch(() => caches.match(request))
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(
      // Notificar o app para sincronizar
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_OFFLINE_DATA',
            timestamp: new Date(),
          });
        });
      })
    );
  }
});
