import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Dynamic import for pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // Use AI assistant to parse the resume
    const aiResponse = await fetch(`${req.nextUrl.origin}/api/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'parse-resume',
        resumeText
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiData.success) {
      return NextResponse.json({ 
        text: resumeText,
        parsed: aiData.data.answer
      });
    }

    return NextResponse.json({ text: resumeText });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
