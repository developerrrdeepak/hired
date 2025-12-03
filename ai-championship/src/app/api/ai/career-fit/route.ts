import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { resumeText, interests, skills, location } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze career fit based on profile:

Resume: ${resumeText}
Interests: ${interests?.join(', ')}
Skills: ${skills?.join(', ')}
Location: ${location || 'Remote'}

Return ONLY valid JSON:
{
  "topRoles": [
    {
      "role": "Frontend Developer",
      "fitScore": 92,
      "reason": "Strong match with React skills",
      "salaryRange": "$80k-$120k",
      "demand": "High"
    }
  ],
  "careerPath": "Start as Junior → Mid-level in 2 years → Senior in 5 years",
  "locationOpportunities": ["San Francisco", "Remote"],
  "topCompanies": ["Google", "Meta", "Startup"],
  "recommendations": ["Build portfolio", "Learn TypeScript"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Career fit analysis error:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to analyze career fit', details: errorMessage },
      { status: 500 }
    );
  }
}
