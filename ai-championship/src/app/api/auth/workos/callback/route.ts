import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const userType = state?.split(':')[0];

  // Dynamic Base URL
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code_received`);
  }

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID || '',
    });

    const auth = getAuth();
    const firestore = getFirestore();
    
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(user.email);
    } catch {
      // User doesn't exist, create them
      firebaseUser = await auth.createUser({
        email: user.email,
        displayName: `${user.firstName} ${user.lastName}`,
        emailVerified: user.emailVerified,
      });
      
      const role = userType === 'employer' ? 'Owner' : 'Candidate';
      const organizationId = role === 'Owner' ? `org-${firebaseUser.uid}` : `personal-${firebaseUser.uid}`;
      
      await firestore.collection('users').doc(firebaseUser.uid).set({
        id: firebaseUser.uid,
        organizationId,
        email: user.email,
        displayName: `${user.firstName} ${user.lastName}`,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        onboardingComplete: false,
      });

      await firestore.collection('organizations').doc(organizationId).set({
        id: organizationId,
        name: role === 'Owner' ? `${user.firstName}'s Organization` : `${user.firstName}'s Profile`,
        ownerId: firebaseUser.uid,
        type: role === 'Owner' ? 'company' : 'personal',
        primaryBrandColor: '207 90% 54%',
        logoUrl: '',
        about: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Set custom claims so the frontend knows the role immediately
    const userSnapshot = await firestore.collection('users').doc(firebaseUser.uid).get();
    const userData = userSnapshot.data();
    const role = userData?.role || (userType === 'employer' ? 'Owner' : 'Candidate');
    
    await auth.setCustomUserClaims(firebaseUser.uid, { 
        role: role, 
        organizationId: userData?.organizationId 
    });

    const customToken = await auth.createCustomToken(firebaseUser.uid);
    
    const redirectUrl = new URL(baseUrl);
    // Redirect to the dedicated auth callback page to handle the token exchange
    redirectUrl.pathname = '/auth/callback';
    redirectUrl.searchParams.set('token', customToken);
    redirectUrl.searchParams.set('provider', 'workos');
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('WorkOS Auth Error:', error);
    // Pass the error message to the login page for debugging
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    return NextResponse.redirect(`${baseUrl}/login?error=${errorMessage}`);
  }
}
