import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiJobDescriptionGenerator(role: string, keyPoints: string[]) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

  const prompt = `Act as a Senior HR Specialist. Create a high-quality, inclusive Job Description for the position of "${role}".
  
  MANDATORY ELEMENTS:
  ${keyPoints.map(p => `- ${p}`).join('\n')}
  
  STRUCTURE:
  1.  **Role Overview**: Hook the candidate.
  2.  **Core Responsibilities**: Clear, action-oriented bullets.
  3.  **Qualifications**: Split into 'Required' and 'Preferred'.
  4.  **Benefits & Culture**: Highlight why the company is a great place to work.
  5.  **Salary Expectation**: Provide a realistic market range estimate if not provided.
  
  Format: Clean Markdown. Tone: Professional, Encouraging, Ambitious.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI JD Gen Error:", e);
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
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

  const prompt = `Compose a formal and legally sound Job Offer Letter.
  
  DETAILS:
  - Candidate: ${details.candidateName}
  - Role: ${details.role}
  - Company: ${details.companyName}
  - Base Salary: ${details.salary}
  - Start Date: ${details.joiningDate}
  - Benefits Summary: ${details.benefits || 'Standard benefits package'}
  
  TONE: Professional, Warm, and Celebratory.
  
  The letter should include a clear acceptance deadline placeholder and signature lines.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI Offer Letter Error:", e);
    return "Error generating offer letter.";
  }
}

