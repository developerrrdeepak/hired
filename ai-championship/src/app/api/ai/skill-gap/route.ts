import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { targetRole, currentSkills, experience } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze skill gap for career transition:

Target Role: ${targetRole}
Current Skills: ${currentSkills?.join(', ') || 'None'}
Experience: ${experience || 'Beginner'}

Return ONLY valid JSON:
{
  "requiredSkills": ["skill1", "skill2"],
  "currentSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "learningPath": [
    {"step": 1, "skill": "HTML/CSS", "duration": "2 weeks", "resources": ["link1"]},
    {"step": 2, "skill": "JavaScript", "duration": "4 weeks", "resources": ["link1"]}
  ],
  "projectSuggestions": ["project1", "project2"],
  "estimatedTime": "3-6 months",
  "difficulty": "Intermediate"
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
    console.error('Skill gap analysis error:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to analyze skill gap', details: errorMessage },
      { status: 500 }
    );
  }
}
