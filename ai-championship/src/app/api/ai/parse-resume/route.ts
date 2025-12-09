import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

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
    
    let resumeText = '';
    
    // Extract text from PDF
    if (file.name.endsWith('.pdf')) {
      try {
        const pdfData = await pdf(buffer);
        resumeText = pdfData.text;
        console.log('Extracted PDF text length:', resumeText.length);
      } catch (error) {
        console.error('PDF extraction error:', error);
        return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
      }
    } else {
      // For non-PDF files, convert to base64 and use Gemini vision
      resumeText = buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Resume appears to be empty or unreadable' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this resume text and extract ALL information. Return ONLY a valid JSON object with this exact structure:

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

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation.

RESUME TEXT:
${resumeText}`;

    const result = await model.generateContent(prompt);

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
