/* eslint-disable no-undef */
// Firebase Messaging Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyPlaceholder",
  authDomain: "nehdo-23bd4.firebaseapp.com",
  projectId: "nehdo-23bd4",
  storageBucket: "nehdo-23bd4.appspot.com",
  messagingSenderId: "113567816697247044384",
  appId: "1:113567816697247044384:web:placeholder",
};

try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'SHVÈRAA Notification';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || '',
      icon: payload.notification?.icon || payload.data?.icon || '/logo.png',
      badge: '/favicon.svg',
      data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.warn('[firebase-messaging-sw.js] Firebase SW initialization warning:', error);
}

// Fallback handling for generic Web Push events
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || data.notification?.title || 'SHVÈRAA Fine Jewellery';
      const options = {
        body: data.body || data.notification?.body || '',
        icon: data.icon || data.notification?.icon || '/logo.png',
        badge: '/favicon.svg',
        data: data.data || data,
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch {
      event.waitUntil(
        self.registration.showNotification('SHVÈRAA Fine Jewellery', {
          body: event.data.text(),
          icon: '/logo.png',
        })
      );
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
