import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function generateJobDescription(
  title: string,
  requirements: string[],
  companyContext?: string
) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API Key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
    Generate a professional and inclusive job description for:
    Role: ${title}
    Key Requirements: ${requirements.join(', ')}
    ${companyContext ? `Company Context: ${companyContext}` : ''}
    
    Structure the output with markdown headings:
    - About the Role
    - Key Responsibilities
    - Required Qualifications
    - Preferred Qualifications
    - Why Join Us
    
    Make the tone professional, welcoming, and exciting.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
