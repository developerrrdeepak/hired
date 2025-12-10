
import admin from 'firebase-admin';

// This is now the SINGLE source of truth for Firebase Admin initialization.
if (!admin.apps.length) {
  // Vercel environment variables can struggle with multi-line strings.
  // Using a Base64 encoded key is the most robust solution.
  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (encodedServiceAccount) {
    try {
      // Decode the Base64 string to get the original JSON string.
      const decodedJson = Buffer.from(encodedServiceAccount, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(decodedJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
      console.log('✅ Firebase Admin SDK initialized successfully via Base64 key.');

    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error.message);
    }
  } else {
    console.warn('🔥 FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set. Server-side functionality will be disabled.');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
