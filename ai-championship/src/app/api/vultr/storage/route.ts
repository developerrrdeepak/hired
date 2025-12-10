import { NextRequest, NextResponse } from 'next/server';
import { Vultr } from '@/lib/vultr';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucketName = process.env.VULTR_BUCKET_NAME;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if(!bucketName) {
      return NextResponse.json({ error: 'Vultr bucket name not configured.' }, { status: 500 });
    }

    const vultr = new Vultr();
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await vultr.uploadFile(bucketName, file.name, buffer, file.type);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Vultr storage error:', error);
    return NextResponse.json({ error: 'Failed to upload to Vultr storage' }, { status: 500 });
  }
}
