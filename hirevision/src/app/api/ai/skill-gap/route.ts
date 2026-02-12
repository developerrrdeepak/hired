import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { currentSkills, targetRole, targetJobDescription } = await req.json();

    if (!currentSkills || !targetRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a Senior Technical Career Coach. Analyze the skill gap for a candidate.

CURRENT SKILLS: ${currentSkills.join(', ')}
TARGET ROLE: ${targetRole}
${targetJobDescription ? `JOB DESCRIPTION: ${targetJobDescription}` : ''}

Provide a JSON response with:
{
  "analysisSummary": "Brief summary of readiness",
  "readinessScore": 75,
  "skillGaps": [
    {
      "missingSkill": "Skill name",
      "importance": "Critical/High/Medium",
      "gapDescription": "Why this matters",
      "recommendedResources": [
        {"title": "Resource name", "type": "Course", "estimatedTime": "4 weeks", "description": "What you'll learn"}
      ]
    }
  ],
  "projectIdea": "A practical project to build these skills"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return NextResponse.json(data);
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Skill gap error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

