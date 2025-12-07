import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiPitchDeckGenerator(idea: string, market: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a 10-slide startup pitch deck outline for this idea:
  Idea: "${idea}"
  Target Market: "${market}"
  
  For each slide, provide:
  1. Title
  2. Key content/bullet points
  3. Suggestion for visuals (chart, image description)
  
  Return as JSON: { "slides": [{ "title": "string", "content": ["string"], "visual": "string" }] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    return null;
  }
}

export async function aiCoFounderMatcher(founderProfile: any, idealPartner: string) {
  // Simulating matching logic with AI reasoning
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `I am a founder with these skills: ${founderProfile.skills.join(', ')}.
  I am looking for a co-founder who is: ${idealPartner}.
  
  Generate 3 persona profiles of ideal co-founders I should look for.
  For each persona, include: Role, Key Skills, Complementary Traits.
  
  Return JSON: { "matches": [{ "role": "string", "skills": ["string"], "traits": "string" }] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0])?.matches : [];
  } catch (e) {
    return [];
  }
}
