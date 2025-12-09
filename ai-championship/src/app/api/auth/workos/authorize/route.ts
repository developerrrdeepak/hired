import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json();
    
    const clientId = process.env.WORKOS_CLIENT_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:9002/api/auth/workos/callback';
    
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId,
      redirectUri,
      state: `${userType}:${Date.now()}`,
    });

    return NextResponse.json({ url: authorizationUrl });
  } catch (error) {
    console.error('WorkOS authorization error:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}
