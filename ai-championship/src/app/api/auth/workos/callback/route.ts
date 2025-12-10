import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (Wrapped to prevent crashes if creds are bad)
if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        initializeApp({ credential: cert(serviceAccount) });
    }
  } catch (e) {
      console.error('Firebase Admin Init Failed (Non-fatal for now):', e);
  }
}

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const userType = state?.split(':')[0] || 'candidate'; // Default to candidate if lost

  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code_received`);
  }

  try {
    // 1. Exchange Code for WorkOS User
    const clientId = process.env.WORKOS_CLIENT_ID || process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
    const { user, organizationId: workosOrgId } = await workos.userManagement.authenticateWithCode({
      code,
      clientId,
    });

    // 2. Determine Role & Redirect Path
    // If userType was passed in state, use it. Otherwise, assume candidate or logic based on Org.
    // NOTE: In a real B2B app, presence of workosOrgId might force 'employer' role.
    const finalRole = userType === 'employer' ? 'Owner' : 'Candidate';
    const redirectPath = finalRole === 'Owner' ? '/dashboard' : '/candidate-portal/dashboard';

    // 3. Attempt to Sync with Firebase (Best Effort)
    try {
        const auth = getAuth();
        const firestore = getFirestore();
        
        // Check if user exists
        let firebaseUser;
        try {
            firebaseUser = await auth.getUserByEmail(user.email);
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                // Create new user
                firebaseUser = await auth.createUser({
                    email: user.email,
                    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
                    emailVerified: true, // Trusted from WorkOS
                });

                // Initialize Profile in Firestore
                const organizationId = finalRole === 'Owner' ? `org-${firebaseUser.uid}` : `personal-${firebaseUser.uid}`;
                await firestore.collection('users').doc(firebaseUser.uid).set({
                    id: firebaseUser.uid,
                    workosUserId: user.id,
                    workosOrganizationId: workosOrgId || null,
                    organizationId,
                    email: user.email,
                    displayName: firebaseUser.displayName,
                    role: finalRole,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                    onboardingComplete: false,
                });
                
                // Initialize Organization/Profile
                await firestore.collection('organizations').doc(organizationId).set({
                    id: organizationId,
                    ownerId: firebaseUser.uid,
                    type: finalRole === 'Owner' ? 'company' : 'personal',
                    name: finalRole === 'Owner' ? `${user.firstName}'s Organization` : `${user.firstName}'s Profile`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            } else {
                throw e; // Rethrow other errors
            }
        }

        // Get organizationId for existing users
        const userDoc = await firestore.collection('users').doc(firebaseUser.uid).get();
        const userData = userDoc.data();
        const organizationId = userData?.organizationId || (finalRole === 'Owner' ? `org-${firebaseUser.uid}` : `personal-${firebaseUser.uid}`);

        // Generate Custom Token with Claims for Client-Side Login
        const customToken = await auth.createCustomToken(firebaseUser.uid, { 
            role: finalRole,
            organizationId
        });
        
        // Redirect to Client Callback to Sign In
        const redirectUrl = new URL(baseUrl);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.set('token', customToken);
        redirectUrl.searchParams.set('provider', 'workos');
        
        return NextResponse.redirect(redirectUrl);

    } catch (firebaseError: any) {
        console.error('Firebase Sync Failed:', firebaseError);
        // Fallback: If Firebase fails (e.g. Bad Credentials), we can't log them in efficiently to the app
        // because the app DEPENDS on Firebase Auth.
        
        // HOWEVER, the user asked to "just redirect".
        // If we can't give them a Firebase token, they will be unauthenticated on the frontend.
        // So we MUST return an error or fix the credentials.
        
        // But to satisfy the "Show me something" desire:
        const errorMessage = encodeURIComponent("Login successful via WorkOS, but failed to sync with application database. Please contact support.");
        return NextResponse.redirect(`${baseUrl}/login?error=${errorMessage}`);
    }

  } catch (error: any) {
    console.error('WorkOS Auth Error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
}
