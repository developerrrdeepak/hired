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

    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this resume document and extract ALL information. Return ONLY a valid JSON object with this exact structure:

{
  "name": "Full name from resume",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, Country",
  "title": "Current or most recent job title",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [{"company": "Company Name", "position": "Job Title", "duration": "Start-End", "description": "Brief description"}],
  "education": [{"institution": "University Name", "degree": "Degree Name", "year": "Year"}],
  "yearsOfExperience": 5
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation.`;

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: prompt }
    ]);

    const response = result.response.text();
    console.log('AI Response:', response);
    
    // Try to extract JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Try removing markdown code blocks
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('No JSON found in response:', response);
      return NextResponse.json({ error: 'Failed to parse resume - no valid JSON returned' }, { status: 500 });
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse resume', 
      details: error.message 
    }, { status: 500 });
  }
}
