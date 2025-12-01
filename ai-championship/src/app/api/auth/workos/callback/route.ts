import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
    const WORKOS_CLIENT_ID = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;

    if (!WORKOS_API_KEY || !WORKOS_CLIENT_ID) {
      return NextResponse.json({ success: false, error: 'WorkOS not configured' });
    }

    const response = await fetch('https://api.workos.com/sso/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKOS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: WORKOS_CLIENT_ID,
        client_secret: WORKOS_API_KEY,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) throw new Error('WorkOS token exchange failed');
    const data = await response.json();

    return NextResponse.json({
      success: true,
      accessToken: data.access_token,
      profile: data.profile
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
