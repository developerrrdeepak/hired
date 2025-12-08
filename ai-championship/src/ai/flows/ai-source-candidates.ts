
'use server';

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

export const CandidateProfileSchema = z.object({
  name: z.string().describe('Full name of the candidate'),
  profileUrl: z.string().url().describe('URL of the candidate’s professional profile (e.g., LinkedIn, GitHub)'),
  summary: z.string().describe('A brief summary of the candidate’s skills and experience relevant to the job'),
  location: z.string().optional().describe('The candidate’s current location'),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

const AISourceCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The job description to source candidates for'),
});
export type AISourceCandidatesInput = z.infer<typeof AISourceCandidatesInputSchema>;

const AISourceCandidatesOutputSchema = z.object({
  candidates: z.array(CandidateProfileSchema).describe('A list of potential candidates'),
});
export type AISourceCandidatesOutput = z.infer<typeof AISourceCandidatesOutputSchema>;

export async function aiSourceCandidates(input: AISourceCandidatesInput): Promise<AISourceCandidatesOutput> {
  return sourceCandidatesFlow(input.jobDescription);
}

const prompt = `You are an expert technical recruiter. Your task is to find the best possible candidates for the following job description.
Search public platforms like LinkedIn, GitHub, and technical communities for suitable candidates.

Job Description:
{{jobDescription}}

Based on your search, provide a list of at least 5 potential candidates who appear to be a strong match.
For each candidate, return their full name, a URL to their professional profile, a brief summary of their relevant skills and experience, and their location if available.`;

export const sourceCandidatesFlow = ai.defineFlow(
  {
    name: 'sourceCandidatesFlow',
    inputSchema: z.string(),
    outputSchema: z.array(CandidateProfileSchema),
  },
  async (jobDescription) => {
    const result = await ai.generate({
      prompt,
      model: geminiPro,
      input: { jobDescription },
      output: {
        schema: z.object({
          candidates: z.array(CandidateProfileSchema),
        }),
      },
    });
    return result.output()?.candidates || [];
  }
);
