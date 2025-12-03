import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Compare resume with job description and provide screening analysis:

Resume:
${resumeText}

Job Description:
${jobDescription}

Return ONLY valid JSON:
{
  "fitScore": 85,
  "recommendation": "Strong Match",
  "skillsMatch": {
    "matched": ["React", "TypeScript"],
    "missing": ["AWS", "Docker"],
    "matchPercentage": 75
  },
  "experienceMatch": {
    "required": "3-5 years",
    "candidate": "4 years",
    "match": true
  },
  "strengths": ["Strong frontend skills", "Good communication"],
  "gaps": ["Lacks cloud experience", "No DevOps knowledge"],
  "redFlags": ["Job hopping", "Career gap"],
  "interviewQuestions": ["Tell me about your React experience", "How do you handle state management?"],
  "salaryExpectation": "$100k-$120k",
  "decision": "Shortlist for interview"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response');
    }

    const screening = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, screening });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auto-screening error:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to screen candidate', details: errorMessage },
      { status: 500 }
    );
  }
}
