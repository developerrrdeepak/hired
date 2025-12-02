import { aif, genkit } from '@genkit-ai/ai';
import { flow } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai';
import * as z from 'zod';

const CandidateProfileSchema = z.object({
  name: z.string().describe('Full name of the candidate'),
  profileUrl: z.string().url().describe('URL of the candidate’s professional profile (e.g., LinkedIn, GitHub)'),
  summary: z.string().describe('A brief summary of the candidate’s skills and experience relevant to the job'),
  location: z.string().optional().describe('The candidate’s current location'),
});

const CandidateSourcingOutputSchema = z.array(CandidateProfileSchema);

export const sourceCandidatesFlow = flow(
  {
    name: 'sourceCandidates',
    inputSchema: z.string().describe('The job description to source candidates for'),
    outputSchema: CandidateSourcingOutputSchema,
  },
  async (jobDescription) => {
    const prompt = `
      As an expert technical recruiter, your task is to find the best possible candidates for the following job description.
      Search public platforms like LinkedIn, GitHub, and technical communities for suitable candidates.

      Job Description:
      ---
      ${jobDescription}
      ---

      Based on your search, provide a list of at least 5 potential candidates who appear to be a strong match.
      For each candidate, return their full name, a URL to their professional profile, a brief summary of their relevant skills and experience, and their location if available.
    `;

    const llmResponse = await genkit.generate({
      prompt,
      model: geminiPro,
      output: {
        schema: CandidateSourcingOutputSchema,
      },
      config: {
        temperature: 0.3,
      },
    });

    const candidates = llmResponse.output();
    if (!candidates) {
      throw new Error('Failed to source candidates.');
    }

    return candidates;
  }
);
