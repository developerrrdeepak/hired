
import admin from 'firebase-admin';
import { z } from 'zod';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://studio-1555095820-f32c6.firebaseio.com`,
            });
        }
    } catch (e) {
        console.error('🔥 Firebase Admin SDK initialization error:', e);
    }
} else {
    console.warn('🔥 FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
