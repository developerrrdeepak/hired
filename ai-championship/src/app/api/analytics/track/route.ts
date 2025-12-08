import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { event, properties, timestamp } = await req.json();
    
    console.log('Analytics:', { event, properties, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
