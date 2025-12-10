import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

// The 'pdf-parse' library does not have a default export.
// We must import it using the `import * as pdf from 'pdf-parse'` syntax if it's a module
// or require if it's commonjs. Given the error, it's likely a commonjs issue with esm.
// A robust way is to use require.
// const pdf = require('pdf-parse');


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Using the imported pdf function directly
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
