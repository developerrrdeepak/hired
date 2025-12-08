import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

const ResumeAnalysisSchema = z.object({
  skills: z.array(z.string()),
  experience: z.array(z.object({
    skill: z.string(),
    years: z.number(),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.number().optional(),
  })),
  workHistory: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string(),
    achievements: z.array(z.string()).optional(), // Added for deeper analysis
  })),
  executiveSummary: z.string().optional(), // Added professional summary
  strengths: z.array(z.string()).optional(), // Added specific strengths
  weaknesses: z.array(z.string()).optional(), // Added areas for improvement
});

export const smarterResumeAnalysisFlow = async (resumeUrl: string) => {
  if (!resumeUrl || typeof resumeUrl !== 'string') {
      throw new Error("Invalid resume URL provided for analysis.");
  }

  // 1. Fetch the file content
  let fileBuffer: Buffer;
  let mimeType: string = 'application/pdf'; // Default assumption

  try {
      if (resumeUrl.startsWith('http')) {
          const response = await fetch(resumeUrl);
          if (!response.ok) throw new Error(`Failed to fetch resume: ${response.statusText}`);
          const arrayBuffer = await response.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type');
          if (contentType) mimeType = contentType;
      } else {
           console.warn("Non-HTTP resume path provided, falling back to mock.", resumeUrl);
           return getMockData();
      }
  } catch (error) {
      console.error("Error fetching resume file:", error);
      throw new Error("Failed to retrieve resume file for analysis.");
  }

  // 2. call Gemini
  try {
      const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
          console.warn("No Google AI API Key found, using mock data.");
          return getMockData();
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Using 2.0-flash-exp for superior context handling and speed with documents
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); 

      const prompt = `
        Act as a Senior Technical Recruiter. Perform a comprehensive analysis of the attached resume file.

        EXTRACT AND STRUCTURE THE FOLLOWING DATA:
        1. "skills": A clean list of technical and professional skills found.
        2. "experience": Calculate years of experience for each major skill based on the timeline.
        3. "education": List institutions, degrees, and graduation years.
        4. "workHistory": List companies, roles, durations, and extract 2-3 key achievements per role if available.
        5. "executiveSummary": Write a professional 3-sentence summary of the candidate.
        6. "strengths": List 3 key professional strengths.
        7. "weaknesses": List 2 potential gaps or areas for development relative to senior roles.
        
        RETURN STRICT VALID JSON matching this schema:
        {
          "skills": ["string"],
          "experience": [{"skill": "string", "years": number}],
          "education": [{"institution": "string", "degree": "string", "year": number}],
          "workHistory": [{"company": "string", "position": "string", "duration": "string", "achievements": ["string"]}],
          "executiveSummary": "string",
          "strengths": ["string"],
          "weaknesses": ["string"]
        }
      `;

      const result = await model.generateContent([
          prompt,
          {
              inlineData: {
                  data: fileBuffer.toString('base64'),
                  mimeType: mimeType
              }
          }
      ]);

      const text = result.response.text();
      // Robust JSON extraction
      let jsonStr = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          jsonStr = jsonMatch[0];
      }
      
      const data = JSON.parse(jsonStr);
      return ResumeAnalysisSchema.parse(data);

  } catch (error) {
      console.error("AI Analysis failed:", error);
      return getMockData(); 
  }
};

function getMockData() {
  return {
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Next.js', 'GraphQL'],
    experience: [
      { skill: 'React', years: 5 },
      { skill: 'TypeScript', years: 4 },
      { skill: 'Node.js', years: 3 },
      { skill: 'Project Management', years: 2 },
    ],
    education: [
      { institution: 'University of Demo', degree: 'B.S. in Computer Science', year: 2018 },
    ],
    workHistory: [
      { company: 'Demo Corp', position: 'Senior Frontend Developer', duration: '2020-Present', achievements: ['Improved performance by 40%', 'Led team of 5'] },
      { company: 'Mockup Inc', position: 'Software Engineer', duration: '2018-2020', achievements: ['Built internal tools'] },
    ],
    executiveSummary: 'Experienced Frontend Developer with a strong background in React ecosystems.',
    strengths: ['Technical Leadership', 'Performance Optimization'],
    weaknesses: ['Limited Cloud Architecture experience'],
    demoMode: true,
  };
}
