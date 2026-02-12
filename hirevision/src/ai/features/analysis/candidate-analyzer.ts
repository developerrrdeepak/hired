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
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

  const prompt = `
    Act as a Senior Talent Acquisition Specialist and Technical Recruiter. Analyze the following candidate resume${jobDescription ? ' specifically for the provided job description' : ' to determine their overall professional profile'}.
    
    RESUME CONTENT:
    ${resumeText}
    
    ${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ''}
    
    Provide a structured JSON response (do not include markdown formatting like \`\`\`json) with the following fields:
    1. "key_skills": Array of string. Extract the most relevant technical and soft skills (limit to top 10).
    2. "experience_summary": String. A professional, executive-style summary (2-3 sentences) of the candidate's background.
    3. "score": Number (0-100). A match score indicating suitability${jobDescription ? ' for the role' : ' for senior-level roles in their domain'}. Be rigorous.
    4. "gaps": Array of string. Identify specific missing skills, experiences, or certifications that would strengthen their profile${jobDescription ? ' for this specific job' : ''}.
    5. "interview_questions": Array of string. 3 high-impact, role-specific interview questions to validate their expertise.
    6. "strengths": Array of string. What are the standout qualities of this candidate?
    
    Ensure the tone is objective, professional, and insightful.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Improved JSON parsing resilience
    let jsonString = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       jsonString = jsonMatch[0];
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    // Return a graceful fallback or rethrow depending on needs, but here we throw to let the caller handle
    throw new Error('Failed to analyze candidate profile');
  }
}

