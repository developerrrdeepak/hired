import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiSkillGapAnalysis(currentSkills: string[], targetRole: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Act as a Senior Career Coach and Technical Mentor. Perform a detailed skill gap analysis for a professional targeting the role of "${targetRole}".
  
  CURRENT SKILLS: ${currentSkills.join(', ')}
  
  Analyze the market requirements for "${targetRole}" and compare.
  
  IMPORTANT: Create EXACTLY 8 weeks of learning roadmap. Do not skip any week from 1 to 8.
  
  Return a JSON object:
  { 
    "missingSkills": ["string"], // Top 5 critical missing technical/soft skills
    "roadmap": [
      { 
        "week": 1, // Week 1
        "focus": "string", // Main topic
        "details": "string", // What specifically to learn
        "resources": ["string"] // Types of resources
      },
      { 
        "week": 2, // Week 2
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 3, // Week 3
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 4, // Week 4
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 5, // Week 5
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 6, // Week 6
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 7, // Week 7
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      },
      { 
        "week": 8, // Week 8
        "focus": "string",
        "details": "string",
        "resources": ["string"]
      }
    ],
    "projects": [
      { 
        "title": "string", 
        "description": "string", // How this project proves the new skills
        "difficulty": "Beginner|Intermediate|Advanced"
      }
    ]
  }
  
  Generate ALL 8 weeks. Do not generate less than 8 weeks.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("AI Skill Gap Analysis Error:", e);
    return null;
  }
}

export async function aiProjectGenerator(skills: string[]) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Design a portfolio-worthy project that integrates the following skills: ${skills.join(', ')}.
  
  The project should solve a tangible real-world problem and demonstrate professional competency.
  
  Return a JSON object:
  { 
    "title": "string", 
    "tagline": "string",
    "problem_solved": "string", // The 'Why'
    "architecture": "string", // High-level suggestion
    "mvp_features": ["string"], // Core requirements
    "advanced_features": ["string"] // Stretch goals to impress recruiters
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("AI Project Generator Error:", e);
    return null;
  }
}
