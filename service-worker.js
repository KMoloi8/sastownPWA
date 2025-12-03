// service-worker.js
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `sastownhub-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/', 
  '/add.html',
  '/build.png',
  '/businesses.html',
  '/butcheries.html',
  '/carwash.html',
  '/catering.html',
  '/cellphones.html',
  '/choir.html',
  '/CNAME',
  '/contact.html',
  '/content.html',
  '/dance.html',
  '/ebird.jpg',
  '/fashion.html',
  '/frost.png',
  '/funeral.html',
  '/garden.html',
  '/hardware.html',
  '/home.html',
  '/how.jpg',
  '/huyani.jpg',
  '/icon.jpg',
  '/index.html',
  '/kaydeeAccs.png',
  '/kumi.jpg',
  '/laundry.html',
  '/logo.jpg',
  '/logo192.png',
  '/logo512.png',
  '/logo.ico',
  '/lsband.png',
  '/ltrade.png',
  '/lwethu.PNG',
  '/manamela.png',
  '/mohajane.png',
  '/ninja.png',
  '/ndweni.png',
  '/ocean.jpg',
  '/ocean.png',
  '/ojm.jpg',
  '/optic.png',
  '/paint.html',
  '/phola.png',
  '/photographers.html',
  '/pic.jpg',
  '/places.html',
  '/poet.html',
  '/rapper.html',
  '/portia.png',
  '/robots.txt',
  '/rpcsc.png',
  '/salon.html',
  '/schools.html',
  '/sfisogard.png',
  '/sitemap.xml',
  '/spaza.html',
  '/taverns.html',
  '/talent.html',
  '/taxi.html',
  '/transport.jpg',
  '/trio.png',
  '/tyreshop.html',
  '/vuma.png',
  
  '/offline.html',
  
  
  // If you have other file names in root (css/js/images), add them here.
];

// Install - pre-cache core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - cache-first with network update (stale-while-revalidate)
self.addEventListener('fetch', event => {
  // only handle GET requests
  if (event.request.method !== 'GET') return;

  const req = event.request;
  const url = new URL(req.url);

  // For navigation requests (HTML pages) prefer cache, fallback to network, then offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(cachedResp => {
        const networkFetch = fetch(req).then(networkResp => {
          // update cache with fresh copy
          caches.open(CACHE_NAME).then(cache => {
            if (networkResp && networkResp.ok) {
              cache.put(req, networkResp.clone());
            }
          });
          return networkResp.clone();
        }).catch(() => {
          // network failed
          return caches.match('/offline.html');
        });
        // return cached response if available, otherwise wait for network
        return cachedResp || networkFetch;
      })
    );
    return;
  }

  // For other requests (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(networkResp => {
        // update cache in background
        caches.open(CACHE_NAME).then(cache => {
          if (networkResp && networkResp.ok) cache.put(req, networkResp.clone());
        });
        return networkResp.clone();
      }).catch(() => {
        // if no network, return cached or fallback
        return cached;
      });
      // return cached immediately if found, otherwise try network
      return cached || networkFetch;
    })
  );
});

// Optional: listen for skipWaiting message to update immediately
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
