import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiResumeEnhancer(resumeText: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze this resume and provide:
  1. An ATS Score (0-100) based on industry standards.
  2. List of 5 missing high-value keywords.
  3. Suggestions to improve grammar and impact.
  
  Resume:
  "${resumeText.substring(0, 5000)}"
  
  Return strictly JSON: { "atsScore": number, "missingKeywords": string[], "suggestions": string[] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("Resume Enhancer Error", e);
    return null;
  }
}

export async function aiJobFitScore(resumeText: string, jobDescription: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Compare this resume against the job description.
  
  Resume: "${resumeText.substring(0, 3000)}"
  Job Description: "${jobDescription.substring(0, 3000)}"
  
  Provide:
  1. A Match Score (0-100).
  2. A brief 1-sentence reasoning.
  
  Return strictly JSON: { "score": number, "reasoning": string }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, reasoning: "Analysis failed" };
  } catch (e) {
    return { score: 0, reasoning: "AI Error" };
  }
}

export async function aiCareerPathAdvisor(resumeText: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Based on this resume, predict the best next career role and list 3 key skills to learn to get there.
  
  Resume: "${resumeText.substring(0, 3000)}"
  
  Return strictly JSON: { "nextRole": string, "skillsToLearn": string[] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    return null;
  }
}
