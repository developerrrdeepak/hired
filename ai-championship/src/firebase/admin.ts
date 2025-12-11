
import admin from 'firebase-admin';

// This is now the SINGLE source of truth for Firebase Admin initialization.
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Crucial fix: explicitly replace escaped newlines with actual newlines.
  // Vercel might pass this as a string with literal \n, so we convert it.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
      console.log('✅ Firebase Admin SDK initialized successfully with separate env vars.');
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error.message);
    }
  } else {
    console.warn('🔥 Missing Firebase Admin credentials (project ID, client email, or private key). Server-side functionality will be disabled.');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
