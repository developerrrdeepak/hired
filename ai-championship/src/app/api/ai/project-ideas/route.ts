import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { skill, difficulty } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate EXACTLY 3 unique project ideas for learning ${skill} at ${difficulty} level.

IMPORTANT: Generate ALL 3 projects. Do not generate less than 3.

For EACH of the 3 projects, provide:
1. Project Title
2. Brief Description (2-3 sentences)
3. MVP Features (list EXACTLY 5 core features)
4. Bonus Challenges (list EXACTLY 3 advanced features)
5. Tech Stack (list 3-4 technologies)
6. Estimated Time (in hours)

Format as JSON array with EXACTLY 3 objects:
[
  {
    "title": "Project 1 Name",
    "description": "Brief description",
    "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
    "bonusChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "techStack": ["Tech 1", "Tech 2", "Tech 3"],
    "estimatedHours": 20
  },
  {
    "title": "Project 2 Name",
    "description": "Brief description",
    "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
    "bonusChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "techStack": ["Tech 1", "Tech 2", "Tech 3"],
    "estimatedHours": 25
  },
  {
    "title": "Project 3 Name",
    "description": "Brief description",
    "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
    "bonusChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "techStack": ["Tech 1", "Tech 2", "Tech 3"],
    "estimatedHours": 30
  }
]

Make projects practical, modern, and portfolio-worthy. Generate ALL 3 projects.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
    const projects = JSON.parse(jsonMatch[0]);
    
    // Validate that all required fields are present
    const validatedProjects = projects.map((p: any) => ({
      title: p.title || 'Untitled Project',
      description: p.description || 'No description',
      mvpFeatures: Array.isArray(p.mvpFeatures) ? p.mvpFeatures : [],
      bonusChallenges: Array.isArray(p.bonusChallenges) ? p.bonusChallenges : [],
      techStack: Array.isArray(p.techStack) ? p.techStack : [],
      estimatedHours: p.estimatedHours || 20
    }));

    return NextResponse.json({ projects: validatedProjects });
  } catch (error) {
    console.error('Project ideas error:', error);
    return NextResponse.json({ error: 'Failed to generate project ideas' }, { status: 500 });
  }
}
