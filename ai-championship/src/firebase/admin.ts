
import admin from 'firebase-admin';

// Check if the app is already initialized
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel automatically replaces `\n` with the actual newline character from the dashboard.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY; 

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
      console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error.message);
    }
  } else {
    console.warn('🔥 Missing Firebase Admin credentials. Some server-side functionality will be disabled.');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
