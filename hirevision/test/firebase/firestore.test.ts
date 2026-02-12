/**
 * Firestore Integration Tests
 * Tests real Firestore operations using test namespace
 */

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const testConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:test',
};

describe('Firestore Operations', () => {
  let firestore: any;
  let testApp: any;

  beforeAll(() => {
    if (!getApps().length) {
      testApp = initializeApp(testConfig, 'firestore-test');
      firestore = getFirestore(testApp);
    }
  });

  afterAll(async () => {
    if (testApp) {
      await deleteApp(testApp);
    }
  });

  it('should create a document', async () => {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    };

    const docRef = doc(firestore, 'test-users', 'test-doc-1');
    await setDoc(docRef, testData);

    const docSnap = await getDoc(docRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()?.name).toBe('Test User');

    // Cleanup
    await deleteDoc(docRef);
  });

  it('should read documents from collection', async () => {
    const testCollection = collection(firestore, 'test-collection');
    
    // Add test documents
    await addDoc(testCollection, { value: 1 });
    await addDoc(testCollection, { value: 2 });

    const querySnapshot = await getDocs(testCollection);
    expect(querySnapshot.size).toBeGreaterThanOrEqual(2);
  });

  it('should handle missing documents', async () => {
    const docRef = doc(firestore, 'test-users', 'non-existent');
    const docSnap = await getDoc(docRef);
    expect(docSnap.exists()).toBe(false);
  });
});
