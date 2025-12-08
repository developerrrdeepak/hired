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
    As a Senior HR Consultant, draft a compelling and professional job description for the role of "${title}".
    
    KEY REQUIREMENTS TO INCLUDE:
    ${requirements.map(req => `- ${req}`).join('\n')}
    
    ${companyContext ? `COMPANY CONTEXT/CULTURE:\n${companyContext}` : ''}
    
    Please structure the output using clean Markdown with the following sections:
    
    ## About the Role
    [An engaging introduction that hooks the candidate and explains the impact of this position.]
    
    ## Key Responsibilities
    [A comprehensive, bulleted list of what the person will do day-to-day and strategically.]
    
    ## Required Qualifications
    [The non-negotiable skills and experiences needed.]
    
    ## Preferred Qualifications
    [Skills that would be a "plus" and set a candidate apart.]
    
    ## Why Join Us?
    [A persuasive section highlighting benefits, culture, growth opportunities, and why this is a great career move.]
    
    ## How to Apply
    [A standard professional closing instruction.]
    
    TONE: Professional, inclusive, ambitious, and welcoming. Avoid generic clichés; use active, powerful language.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
