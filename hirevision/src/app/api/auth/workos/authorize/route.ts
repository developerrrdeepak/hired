import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json();
    
    // Check for Client ID in both standard and NEXT_PUBLIC_ variables
    const clientId = process.env.WORKOS_CLIENT_ID || process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
    
    if (!clientId) {
      console.error('WorkOS Error: Client ID is missing in environment variables');
      return NextResponse.json({ error: 'WorkOS Client ID is not configured' }, { status: 500 });
    }

    if (!process.env.WORKOS_API_KEY) {
      console.error('WorkOS Error: API Key is missing');
      return NextResponse.json({ error: 'WorkOS API Key is not configured' }, { status: 500 });
    }
    
    // Dynamically determine the base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    // Use env var if set, otherwise fallback to dynamic URL
    const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || `${baseUrl}/api/auth/workos/callback`;
    
    console.log('WorkOS Auth Start:', { clientId: 'Set', redirectUri, userType });

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId,
      redirectUri,
      state: `${userType}:${Date.now()}`,
    });

    return NextResponse.json({ url: authorizationUrl });
  } catch (error: any) {
    console.error('WorkOS authorization error:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL', details: error.message }, { status: 500 });
  }
}

