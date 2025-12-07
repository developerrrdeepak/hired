import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiHackathonIdeaGenerator(topic: string, difficulty: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a unique hackathon challenge idea.
  Topic: ${topic}
  Difficulty: ${difficulty}
  
  Return strictly JSON: {
    "title": "Catchy Title",
    "description": "Brief but exciting description",
    "tasks": ["Task 1", "Task 2"],
    "techStack": ["React", "Node.js", "Firebase"]
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

export async function aiCodeReviewer(codeSnippet: string, language: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return { score: 0, feedback: "AI unavailable" };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Review this ${language} code for a hackathon submission.
  Code:
  "${codeSnippet.substring(0, 3000)}"
  
  Provide:
  1. Score (0-100)
  2. Brief feedback
  
  Return strictly JSON: { "score": number, "feedback": string }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, feedback: "Error parsing" };
  } catch (e) {
    return { score: 0, feedback: "Review failed" };
  }
}
