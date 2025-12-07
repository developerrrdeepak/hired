import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function analyzeCandidateProfile(
  resumeText: string,
  jobDescription?: string
) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API Key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
    Analyze the following candidate resume${jobDescription ? ' against the job description' : ''}.
    
    Resume:
    ${resumeText}
    
    ${jobDescription ? `Job Description:\n${jobDescription}` : ''}
    
    Provide a structured JSON response with:
    1. key_skills: Array of top technical and soft skills
    2. experience_summary: Brief 2-sentence summary
    3. score: 0-100 match score (if job description provided, else general quality score)
    4. gaps: Array of missing skills or areas for improvement
    5. interview_questions: Array of 3 specific technical questions to ask
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Basic cleaning to get JSON content if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       console.error('AI Response format invalid:', text);
       return { error: 'AI response could not be parsed' };
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    throw new Error('Failed to analyze candidate profile');
  }
}
