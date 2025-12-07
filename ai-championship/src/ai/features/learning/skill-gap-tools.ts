import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiSkillGapAnalysis(currentSkills: string[], targetRole: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze skill gap for a user wanting to be a "${targetRole}".
  Current Skills: ${currentSkills.join(', ')}.
  
  Provide:
  1. Missing critical skills (technical & soft).
  2. A step-by-step learning roadmap (Weeks 1-8).
  3. Recommended project ideas to build portfolio.
  
  Return JSON: { 
    "missingSkills": ["string"], 
    "roadmap": [{ "week": "number", "focus": "string", "resources": ["string"] }],
    "projects": [{ "title": "string", "description": "string" }]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    return null;
  }
}

export async function aiProjectGenerator(skills: string[]) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a unique real-world project idea that uses these skills: ${skills.join(', ')}.
  
  Provide:
  1. Project Title & Tagline.
  2. Real-world problem it solves.
  3. Key features to implement (MVP).
  4. Bonus features for advanced learning.
  
  Return JSON: { "title": "string", "problem": "string", "mvp": ["string"], "bonus": ["string"] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    return null;
  }
}
