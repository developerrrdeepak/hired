import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';

// Add this check at the start of your hooks/functions
const checkConnection = async (firestore: any) => {
  try {
    // Just a simple ping or check
    if (!firestore) return false;
    return true;
  } catch (e) {
    console.error("Firestore connection check failed", e);
    return false;
  }
}
