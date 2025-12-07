import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getEnv } from '@/lib/env';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userType = searchParams.get('state')?.split(':')[0]; // Passing userType in state

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID || '',
    });

    // Here we would ideally create a session or token
    // For this implementation, we'll redirect with a token param (simplified)
    // In production, use secure session cookies
    
    // Redirect to frontend to complete Firebase login via custom token exchange
    // We need an endpoint to exchange WorkOS user for Firebase token
    
    const redirectUrl = new URL(getEnv().NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    redirectUrl.pathname = userType === 'employer' ? '/dashboard' : '/candidate/dashboard';
    redirectUrl.searchParams.set('auth_success', 'true');
    redirectUrl.searchParams.set('provider', 'workos');
    redirectUrl.searchParams.set('email', user.email);
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('WorkOS Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
