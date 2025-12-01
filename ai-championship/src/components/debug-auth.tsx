'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export function DebugAuth() {
  const [status, setStatus] = useState('');
  const { auth } = useFirebase();

  const testGoogleAuth = async () => {
    setStatus('Testing...');
    
    if (!auth) {
      setStatus('❌ Firebase auth not initialized');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      setStatus('🔄 Opening Google popup...');
      
      const result = await signInWithPopup(auth, provider);
      setStatus(`✅ Success! User: ${result.user.email}`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.code} - ${error.message}`);
      console.error('Full error:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Firebase Auth Debug</h3>
      <Button onClick={testGoogleAuth}>Test Google Sign-In</Button>
      <div className="mt-2 text-sm">{status}</div>
    </div>
  );
}