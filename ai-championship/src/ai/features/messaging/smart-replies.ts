import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function analyzeTone(message: string): Promise<string> {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return 'neutral';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze the tone of this professional message: "${message}". 
  Return exactly one word that best describes it from this list: "Professional", "Friendly", "Direct", "Urgent", "Casual", "Formal", "Empathetic".`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return 'neutral';
  }
}

export async function suggestReply(lastMessage: string, context: string): Promise<string[]> {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `As a professional communication assistant, suggest 3 distinct replies to the following message.
  
  RECEIVED MESSAGE: "${lastMessage}"
  CONTEXT: ${context} (e.g., Hiring Manager to Candidate, Recruiter to Client)
  
  GUIDELINES:
  1. Reply 1: Positive/Accepting (e.g., "Sounds good", "I'm interested").
  2. Reply 2: Inquisitive/Clarifying (e.g., asking for details).
  3. Reply 3: Declining/Deferring politely.
  
  Return ONLY the 3 text strings separated by newlines. No numbering or labels.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 3);
  } catch (e) {
    return [];
  }
}
