// वारणा गुणपत्रक — किमान service worker.
// उद्देश: PWA/Android पॅकेजिंगसाठी आवश्यक "installability" पूर्ण करणे, आणि app shell (index.html)
// एकदा उघडल्यावर पुढच्या वेळी थोडे जलद व ऑफलाईनही उघडता यावे यासाठी कॅशिंग.
// टीप: गुण/निकालाचा डेटा हा नेहमी क्लाउड (Firebase) किंवा JSON फाईलमधून येतो — तो इथे कॅश केला जात नाही.

const CACHE_NAME = 'varana-gunpatrak-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network-first for the app shell, so the person always gets the latest version when online;
// falls back to the cached copy only when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
