import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function matchCandidateToJob(
  candidateProfile: any,
  jobDescription: string
) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API Key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
    Evaluate the match between this candidate and job.
    
    Candidate Profile:
    ${JSON.stringify(candidateProfile)}
    
    Job Description:
    ${jobDescription}
    
    Return a JSON object with:
    - match_percentage: Number (0-100)
    - strong_matches: Array of skills that match well
    - missing_skills: Array of critical skills missing
    - reasoning: Brief explanation of the score
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { match_percentage: 0, reasoning: 'Analysis failed' };
}
