import { initializeApp, cert } from 'firebase-admin';

let firebaseadmin = null;

try {
  if (process.env.FIERBASESDK) {
    const serviceAccount = typeof process.env.FIERBASESDK === 'string'
      ? JSON.parse(process.env.FIERBASESDK)
      : process.env.FIERBASESDK;
    firebaseadmin = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('[Firebase] Admin SDK initialized successfully');
  } else {
    console.warn('[Firebase] Warning: FIERBASESDK environment variable is not defined.');
  }
} catch (error) {
  console.error('[Firebase] Failed to initialize Firebase Admin SDK:', error.message);
}

export default firebaseadmin;