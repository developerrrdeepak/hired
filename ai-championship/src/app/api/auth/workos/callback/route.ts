import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    // Only initialize if we have the necessary credentials
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        console.warn('Firebase Admin SDK not initialized: Missing credentials');
    }
  } catch (e) {
      console.error('Failed to initialize Firebase Admin:', e);
  }
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
    const clientId = process.env.WORKOS_CLIENT_ID || process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
    
    const { user, organizationId: workosOrgId } = await workos.userManagement.authenticateWithCode({
      code,
      clientId,
    });

    const auth = getAuth();
    const firestore = getFirestore();
    
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(user.email);
      
      // Update existing user with WorkOS ID if missing
      await firestore.collection('users').doc(firebaseUser.uid).set({
        workosUserId: user.id,
        workosOrganizationId: workosOrgId || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // User doesn't exist, create them
        firebaseUser = await auth.createUser({
          email: user.email,
          displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
          emailVerified: user.emailVerified,
        });
        
        const role = userType === 'employer' ? 'Owner' : 'Candidate';
        const organizationId = role === 'Owner' ? `org-${firebaseUser.uid}` : `personal-${firebaseUser.uid}`;
        
        await firestore.collection('users').doc(firebaseUser.uid).set({
          id: firebaseUser.uid,
          workosUserId: user.id,
          workosOrganizationId: workosOrgId || null,
          organizationId,
          email: user.email,
          displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          onboardingComplete: false,
        });

        await firestore.collection('organizations').doc(organizationId).set({
          id: organizationId,
          workosOrganizationId: workosOrgId || null,
          name: role === 'Owner' ? `${user.firstName || 'User'}'s Organization` : `${user.firstName || 'User'}'s Profile`,
          ownerId: firebaseUser.uid,
          type: role === 'Owner' ? 'company' : 'personal',
          primaryBrandColor: '207 90% 54%',
          logoUrl: '',
          about: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        throw err;
      }
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
    let errorMessage = error.message || 'Authentication failed';
    
    // Provide a more helpful error for configuration issues
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('credential')) {
        errorMessage = 'Server configuration error: Firebase credentials invalid. Please check server logs.';
    }

    const encodedError = encodeURIComponent(errorMessage);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodedError}`);
  }
}
