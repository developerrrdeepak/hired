'use client';

import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

export function setupFirebaseForDevelopment(auth: any, firestore: any) {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      // Only connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        if (!auth._delegate._config.emulator) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
        if (!firestore._delegate._databaseId.projectId.includes('demo-')) {
          connectFirestoreEmulator(firestore, 'localhost', 8080);
        }
      }
    } catch (error) {
      console.warn('Firebase emulator connection failed:', error);
    }
  }
}

export function fixFirebaseAuth() {
  // Clear any cached auth state that might be causing issues
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firebase:authUser:AIzaSyAmUbAHWhTTJkW3hdmzUeZztv543A0spwI:[DEFAULT]');
    sessionStorage.clear();
  }
}