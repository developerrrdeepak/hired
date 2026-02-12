import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

export async function aiHackathonIdeaGenerator(topic: string, difficulty: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

  const prompt = `Act as a Chief Technology Officer organizing a global hackathon. Generate a cutting-edge challenge idea.
  
  THEME/TOPIC: ${topic}
  DIFFICULTY LEVEL: ${difficulty}
  
  Your output must be a valid JSON object with:
  1. "title": A catchy, professional title.
  2. "description": An exciting, 2-3 sentence overview of the problem to solve.
  3. "problem_statement": A detailed paragraph explaining the real-world issue.
  4. "tasks": Array of 3-5 specific, actionable milestones or features to build.
  5. "techStack": Array of recommended modern technologies.
  6. "evaluation_criteria": Array of 3 criteria (e.g., "Innovation", "Scalability").
  
  Ensure the idea is feasible yet challenging.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("AI Hackathon Idea Gen Error:", e);
    return null;
  }
}

export async function aiCodeReviewer(codeSnippet: string, language: string) {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return { score: 0, feedback: "AI unavailable" };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

  const prompt = `Perform a rigorous technical code review on the following ${language} submission.
  
  CODE:
  \`\`\`${language}
  ${codeSnippet.substring(0, 5000)}
  \`\`\`
  
  Provide a JSON response:
  {
    "score": number, // 0-100 based on quality, efficiency, and cleanliness
    "feedback": "string", // A concise, constructive summary of what was done well and what needs improvement.
    "bugs": ["string"], // Potential bugs or vulnerabilities
    "improvements": ["string"] // Specific refactoring suggestions
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, feedback: "Error parsing AI response" };
  } catch (e) {
    console.error("AI Code Review Error:", e);
    return { score: 0, feedback: "Review failed due to service error" };
  }
}

