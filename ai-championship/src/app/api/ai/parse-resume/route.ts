import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Extract information from this resume and return ONLY valid JSON:

{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, Country",
  "title": "Current job title",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "Name", "position": "Title", "duration": "2020-2023"}],
  "education": [{"institution": "University", "degree": "Degree", "year": "2020"}],
  "yearsOfExperience": 5
}`;

    const result = await model.generateContent([
      { inlineData: { mimeType: file.type, data: base64 } },
      { text: prompt }
    ]);

    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ data: parsedData });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
