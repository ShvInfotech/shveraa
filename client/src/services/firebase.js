import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase client credentials from Vite environment variables with project fallback defaults


const firebaseConfig = {
  apiKey: "AIzaSyDeH8SssDLeu5Ggbj8toClBq2zGE-6Ku-c",
  authDomain: "nehdo-23bd4.firebaseapp.com",
  projectId: "nehdo-23bd4",
  storageBucket: "nehdo-23bd4.firebasestorage.app",
  messagingSenderId: "784435496062",
  appId: "1:784435496062:web:c50536275ff566ea93442f",
};


const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let app = null;
let messagingInstance = null;

export const initFirebase = () => {
  if (typeof window === 'undefined') return null;
  if (!getApps().length) {
    if (firebaseConfig.apiKey || firebaseConfig.projectId) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (err) {
        console.warn('[Firebase] App initialization error:', err);
      }
    }
  } else {
    app = getApp();
  }
  return app;
};

/**
 * Request notification permission and retrieve the FCM device token
 * Safe fallback: returns null if permissions denied, unsupported, or config missing.
 * Login/register flows will NEVER fail even if token retrieval fails.
 */
export const getDeviceToken = async () => {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check if browser supports notifications & service workers
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Firebase] Notifications or ServiceWorker not supported in this browser.');
      return null;
    }

    // 2. Check if Firebase Messaging is supported
    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.warn('[Firebase] Firebase Messaging is not supported in this environment.');
      return null;
    }

    const firebaseApp = initFirebase();
    if (!firebaseApp) {
      console.warn('[Firebase] Firebase app not initialized. Check your credentials in .env.');
      return null;
    }

    // 3. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[Firebase] Notification permission not granted:', permission);
      return null;
    }

    // 4. Register or get existing Service Worker
    let swRegistration = null;
    try {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    } catch (swErr) {
      console.warn('[Firebase] Service worker registration error:', swErr);
      swRegistration = await navigator.serviceWorker.ready.catch(() => null);
    }

    // 5. Initialize Messaging
    if (!messagingInstance) {
      messagingInstance = getMessaging(firebaseApp);
    }

    // 6. Get FCM Device Token
    const tokenOptions = {};
    if (VAPID_KEY) {
      tokenOptions.vapidKey = VAPID_KEY;
    }
    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }

    const currentToken = await getToken(messagingInstance, tokenOptions);

    if (currentToken) {
      localStorage.setItem('shveraa_device_token', currentToken);
      console.log('[Firebase] Device token acquired successfully:', currentToken.substring(0, 15) + '...');
      return currentToken;
    } else {
      console.warn('[Firebase] No registration token available.');
      return null;
    }
  } catch (error) {
    console.warn('[Firebase] Error retrieving device token:', error);
    // Return cached token if available from previous session
    return localStorage.getItem('shveraa_device_token') || null;
  }
};

/**
 * Setup foreground notification listener
 */
export const onForegroundMessage = (callback) => {
  if (typeof window === 'undefined') return () => {};
  try {
    const firebaseApp = initFirebase();
    if (!firebaseApp) return () => {};

    if (!messagingInstance) {
      messagingInstance = getMessaging(firebaseApp);
    }

    return onMessage(messagingInstance, (payload) => {
      console.log('[Firebase] Foreground notification received:', payload);
      if (typeof callback === 'function') {
        callback(payload);
      }
    });
  } catch (err) {
    console.warn('[Firebase] Foreground message listener error:', err);
    return () => {};
  }
};
