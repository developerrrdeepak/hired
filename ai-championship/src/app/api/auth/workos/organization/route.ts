import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { domain, name } = await request.json();

    const organization = await workos.organizations.createOrganization({
      name,
      domains: [domain],
    });

    return NextResponse.json({ success: true, organization });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
