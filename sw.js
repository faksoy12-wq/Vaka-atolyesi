// Retire the former offline cache for existing installations.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{await caches.delete('vaka-atolyesi-v1');await self.registration.unregister()})()));
