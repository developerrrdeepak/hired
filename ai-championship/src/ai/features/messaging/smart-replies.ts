import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function analyzeTone(message: string): Promise<string> {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return 'neutral';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze the tone of this message: "${message}". 
  Return one word: "Professional", "Friendly", "Direct", "Urgent", or "Casual".`;

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

  const prompt = `Suggest 3 brief, professional replies to this message in a ${context} context:
  Message: "${lastMessage}"
  
  Return ONLY the 3 replies, one per line.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().split('\n').filter(l => l.trim().length > 0).slice(0, 3);
  } catch (e) {
    return [];
  }
}
