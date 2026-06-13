// ⚠️ Changer ce numéro à chaque mise à jour pour forcer le rechargement
const CACHE = 'taquin-v10';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  // Force activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Supprimer TOUS les anciens caches
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Suppression ancien cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Toujours réseau en premier pour index.html (évite le cache périmé)
  if (e.request.url.includes('index.html') || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache first pour les autres assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
