
import admin from 'firebase-admin';
import { z } from 'zod';

const firebaseAdminConfigSchema = z.object({
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Missing Firebase project ID'),
  FIREBASE_CLIENT_EMAIL: z.string().email('Invalid Firebase client email'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'Missing Firebase private key'),
});

const result = firebaseAdminConfigSchema.safeParse(process.env);

if (!result.success) {
  console.warn('🔥 Firebase admin not configured:', result.error.flatten().fieldErrors);
}

if (result.success && !admin.apps.length) {
  const serviceAccount = {
    projectId: result.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: result.data.FIREBASE_CLIENT_EMAIL,
    privateKey: result.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${result.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
