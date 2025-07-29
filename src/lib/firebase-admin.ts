
import { config } from 'dotenv';
config(); // Load environment variables FIRST.

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e: any) {
      console.error('Firebase admin initialization error:', e.message);
      // Throwing an error here is important for environments where the admin SDK is critical.
      // For this app, server-side actions depend on it.
      throw new Error(`Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  } else if (process.env.NODE_ENV === 'production') {
      // In production, the service account key is required.
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in production environment. Firebase Admin SDK cannot be initialized.');
  } else {
    // In development, we can warn but allow the app to run.
    // Server-side features requiring admin privileges will fail gracefully.
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized. Server-side admin features will not work.');
  }
} else {
  adminApp = admin.app();
}

// Export the initialized app
export { adminApp };
