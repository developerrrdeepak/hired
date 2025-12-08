import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiPitchDeckGenerator(idea: string, market: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Act as a Venture Capitalist and Startup Advisor. Create a compelling 10-slide pitch deck structure for a startup with the following premise:
  
  STARTUP IDEA: "${idea}"
  TARGET MARKET: "${market}"
  
  For each slide, provide strategic content that addresses standard VC criteria (Problem, Solution, Market Size, Business Model, Traction, Team).
  
  Return a JSON object:
  { 
    "slides": [
      { 
        "slide_number": number,
        "title": "string", // Professional slide title
        "key_talking_points": ["string"], // Bullet points for the script
        "visual_suggestion": "string" // Description of charts/images
      }
    ] 
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("AI Pitch Deck Gen Error:", e);
    return null;
  }
}

export async function aiCoFounderMatcher(founderProfile: any, idealPartner: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Act as a Startup Team Builder.
  
  CURRENT FOUNDER PROFILE:
  - Skills: ${founderProfile.skills?.join(', ') || 'Not specified'}
  - Background: ${founderProfile.background || 'Not specified'}
  
  DESIRED PARTNER DESCRIPTION: "${idealPartner}"
  
  Generate 3 distinct, detailed personas for ideal co-founders that would maximize this startup's chance of success by complementing the current founder's weaknesses.
  
  Return a JSON object:
  { 
    "matches": [
      { 
        "role_title": "string", // e.g., CTO, COO, Head of Growth
        "primary_skills": ["string"], 
        "complementary_traits": "string", // Why they fit with the founder
        "search_keywords": ["string"] // Keywords to use on LinkedIn/AngelList
      }
    ] 
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0])?.matches : [];
  } catch (e) {
    console.error("AI Co-founder Matcher Error:", e);
    return [];
  }
}
