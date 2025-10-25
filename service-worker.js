// Service Worker - Giulia Castro LP
// Versão: 1.0 (23/10/2025)
// Cache strategy: Network First com fallback para Cache

const CACHE_NAME = 'giulia-castro-v1';
const CACHE_VERSION = '1.0';

// Arquivos para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Fontes Google
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Allura&display=swap',
  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // Imagens do Supabase
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliafotoqrcodebrfav.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliainstagram1.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliainstagram2.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliainstagram3.jpeg',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/qrcodewppgiulia.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/qrcodeinstagramgiulia.png',
  'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/qrcodelpgiuliaclose.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Arquivos em cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro ao cachear:', error);
      })
  );

  // Força o SW a se ativar imediatamente
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Toma controle imediatamente
  return self.clients.claim();
});

// Fetch - Network First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clona e guarda no cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), busca do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Service Worker: Servindo do cache:', event.request.url);
            return cachedResponse;
          }

          // Se não tiver no cache, retorna página offline
          return new Response(
            '<html><body><h1>Offline</h1><p>Você está offline. Conecte-se à internet.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
      })

  );
});

// Background Sync (se suportado)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background Sync');
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados
function syncData() {
  return fetch('/api/sync')
    .then((response) => response.json())
    .then((data) => {
      console.log('✅ Dados sincronizados:', data);
    })
    .catch((error) => {
      console.error('❌ Erro ao sincronizar:', error);
    });
}

// Push Notifications (opcional)
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push recebido');

  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: 'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliafotoqrcodebrlogotipo.png',
    badge: 'https://lhujzzoqebgjbsnezmrt.supabase.co/storage/v1/object/public/Photos/giuliafotoqrcodebrlogotipo.png',
    vibrate: [200, 100, 200],
    tag: 'giulia-castro-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Giulia Castro', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificação clicada');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('✅ Service Worker carregado - v' + CACHE_VERSION);
