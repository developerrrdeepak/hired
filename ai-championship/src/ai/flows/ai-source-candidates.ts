
'use server';

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

export const CandidateProfileSchema = z.object({
  name: z.string().describe('Name of the candidate'),
  currentRole: z.string().describe('Current job title'),
  company: z.string().optional().describe('Current company'),
  matchReason: z.string().describe('Why this profile is a good fit'),
  searchQuery: z.string().describe('Boolean string used to find this profile'),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

const AISourceCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The job description to source candidates for'),
  location: z.string().optional().describe('Target location'),
});
export type AISourceCandidatesInput = z.infer<typeof AISourceCandidatesInputSchema>;

const AISourceCandidatesOutputSchema = z.object({
  sourcingStrategy: z.string().describe("Strategy used to identify these profiles."),
  searchStrings: z.array(z.string()).describe("Effective Boolean search strings for LinkedIn/GitHub."),
  profiles: z.array(CandidateProfileSchema).describe('Simulated candidate profiles matching the criteria.'),
});
export type AISourceCandidatesOutput = z.infer<typeof AISourceCandidatesOutputSchema>;

export async function aiSourceCandidates(input: AISourceCandidatesInput): Promise<AISourceCandidatesOutput> {
  return sourceCandidatesFlow(input);
}

const sourceCandidatesFlow = ai.defineFlow(
  {
    name: 'sourceCandidatesFlow',
    inputSchema: AISourceCandidatesInputSchema,
    outputSchema: AISourceCandidatesOutputSchema,
  },
  async (input) => {
    // Note: Since we cannot browse the live web, we act as a strategy generator and simulator.
    const prompt = `Act as a Master Sourcing Specialist.
    
    JOB DESCRIPTION:
    ${input.jobDescription}
    ${input.location ? `LOCATION: ${input.location}` : ''}

    TASK:
    1.  **Develop a Sourcing Strategy**: Where would these candidates hang out? (GitHub, Dribbble, StackOverflow, etc.)
    2.  **Generate Boolean Search Strings**: Create complex search strings to find these candidates on LinkedIn or Google.
    3.  **Simulate Profiles**: Generate 3 realistic "Ideal Candidate Personas" that would match this role to illustrate what to look for.

    Output structured JSON.`;

    const result = await ai.generate({
      prompt: prompt,
      model: geminiPro,
      output: { schema: AISourceCandidatesOutputSchema },
    });
    
    if (!result.output) {
        throw new Error("Failed to generate sourcing data");
    }
    return result.output;
  }
);
