import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, domains } = await request.json();
    const WORKOS_API_KEY = process.env.WORKOS_API_KEY;

    if (!WORKOS_API_KEY) {
      return NextResponse.json({ success: false, error: 'WorkOS not configured' });
    }

    const response = await fetch('https://api.workos.com/organizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKOS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, domains })
    });

    if (!response.ok) throw new Error('Failed to create organization');
    const data = await response.json();

    return NextResponse.json({ success: true, organization: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
