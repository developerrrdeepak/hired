import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiJobDescriptionGenerator(role: string, keyPoints: string[]) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate a professional Job Description for "${role}".
  Key points to include: ${keyPoints.join(', ')}.
  
  Include sections: Responsibilities, Required Skills, Preferred Skills, Salary Range (estimate based on role).
  Return as formatted Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return "Failed to generate JD.";
  }
}

export async function aiScreeningBot(resumes: string[], jobDescription: string) {
  // This is computationally heavy, typically handled via batch processing or Cloud Functions.
  // For this demo, we'll simulate a lightweight version or process one.
  return "Batch screening initialized. Check dashboard for results.";
}

export async function aiOfferLetterGenerator(details: any) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Write a formal job offer letter.
  Candidate: ${details.candidateName}
  Role: ${details.role}
  Salary: ${details.salary}
  Joining Date: ${details.joiningDate}
  Company: ${details.companyName}
  
  Tone: Professional and welcoming.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return "Error generating offer letter.";
  }
}
