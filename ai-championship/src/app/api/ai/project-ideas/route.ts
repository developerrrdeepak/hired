import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { skill, difficulty } = await req.json();

    const response = await fetch(`${req.nextUrl.origin}/api/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'project-ideas',
        skill,
        difficulty
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const text = data.data.answer;
      const projects = parseProjectIdeas(text);
      return NextResponse.json({ projects });
    }

    throw new Error(data.error || 'Failed to generate projects');
  } catch (error) {
    console.error('Project ideas error:', error);
    return NextResponse.json({ error: 'Failed to generate project ideas' }, { status: 500 });
  }
}

function parseProjectIdeas(text: string) {
  const projects: any[] = [];
  const sections = text.split(/\d+\.\s*\*\*Title\*\*/).filter(s => s.trim());
  
  sections.forEach(section => {
    const project: any = {
      title: '',
      description: '',
      mvpFeatures: [],
      bonusChallenges: [],
      techStack: [],
      estimatedHours: 20
    };

    const titleMatch = section.match(/^:?\s*(.+?)(?:\n|\*\*)/m);
    if (titleMatch) project.title = titleMatch[1].trim();

    const descMatch = section.match(/\*\*Description\*\*:?\s*(.+?)(?=\*\*|$)/s);
    if (descMatch) project.description = descMatch[1].trim().split('\n')[0];

    const mvpMatch = section.match(/\*\*MVP Features\*\*:?([\s\S]*?)(?=\*\*|$)/m);
    if (mvpMatch) {
      project.mvpFeatures = mvpMatch[1].split('\n').filter(l => l.trim().match(/^[-*•\d]/)).map(l => l.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 5);
    }

    const bonusMatch = section.match(/\*\*Bonus Challenges\*\*:?([\s\S]*?)(?=\*\*|$)/m);
    if (bonusMatch) {
      project.bonusChallenges = bonusMatch[1].split('\n').filter(l => l.trim().match(/^[-*•\d]/)).map(l => l.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3);
    }

    const techMatch = section.match(/\*\*Tech Stack\*\*:?([\s\S]*?)(?=\*\*|$)/m);
    if (techMatch) {
      project.techStack = techMatch[1].split('\n').filter(l => l.trim().match(/^[-*•\d]/)).map(l => l.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 4);
    }

    const timeMatch = section.match(/\*\*Estimated Time\*\*:?\s*(\d+)/m);
    if (timeMatch) project.estimatedHours = parseInt(timeMatch[1]);

    if (project.title) projects.push(project);
  });

  return projects.length > 0 ? projects : [{
    title: 'Sample Project',
    description: 'Build a practical application',
    mvpFeatures: ['Core feature 1', 'Core feature 2', 'Core feature 3'],
    bonusChallenges: ['Advanced feature 1'],
    techStack: ['Technology 1', 'Technology 2'],
    estimatedHours: 20
  }];
}
