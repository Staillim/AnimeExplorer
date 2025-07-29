
import { config } from 'dotenv';
config(); // Load environment variables FIRST.

import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

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
      // Do not throw an error here to allow the build to succeed.
      // Functions depending on adminApp will fail gracefully if it's not initialized.
    }
  } else {
    // In any environment, if the key is missing, just warn.
    // The build should not fail because of this.
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized. Server-side admin features will not work.');
  }
} else {
  adminApp = admin.app();
}

// Export the initialized app (it could be undefined)
export { adminApp };
