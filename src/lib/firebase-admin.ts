
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let adminApp: admin.app.App;

if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Firebase admin initialization error', e);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized.');
  }
} else {
    adminApp = admin.app();
}

// Export the initialized app
export { adminApp };
