import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}


export const adminApp = admin.app();
