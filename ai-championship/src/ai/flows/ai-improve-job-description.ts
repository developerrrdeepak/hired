'use server';

/**
 * @fileOverview An AI agent that improves job descriptions.
 *
 * - aiImproveJobDescription - A function that suggests improvements to a job description.
 * - AIImproveJobDescriptionInput - The input type for the aiImproveJobDescription function.
 * - AIImproveJobDescriptionOutput - The return type for the aiImproveJobDescription function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const AIImproveJobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to improve.'),
});
export type AIImproveJobDescriptionInput = z.infer<typeof AIImproveJobDescriptionInputSchema>;

const AIImproveJobDescriptionOutputSchema = z.object({
  improvedJobDescription: z.string().describe('The rewritten, high-quality job description.'),
  changesSummary: z.string().optional().describe('A brief summary of the key improvements made (e.g., "Clarified requirements, removed bias").'),
  scoreImprovement: z.string().optional().describe('Estimated quality score improvement (e.g., "70/100 -> 95/100").'),
});
export type AIImproveJobDescriptionOutput = z.infer<typeof AIImproveJobDescriptionOutputSchema>;

export async function aiImproveJobDescription(input: AIImproveJobDescriptionInput): Promise<AIImproveJobDescriptionOutput> {
  return aiImproveJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiImproveJobDescriptionPrompt',
  input: {schema: AIImproveJobDescriptionInputSchema},
  output: {schema: AIImproveJobDescriptionOutputSchema},
  model: geminiPro,
  prompt: `Act as a Senior Diversity & Inclusion Recruitment Specialist and Copywriter.
  
  TASK:
  Optimize the following Job Description (JD) to attract top-tier talent.
  
  ORIGINAL JD:
  ---
  {{{jobDescription}}}
  ---

  GOALS:
  1.  **Clarity & Structure**: Organize into clear sections (Role, Responsibilities, Requirements, Benefits).
  2.  **Inclusivity**: Remove gender-coded language and bias. Use welcoming, gender-neutral terms.
  3.  **Impact**: Focus on what the candidate will *achieve*, not just what they must *have*.
  4.  **Tone**: Professional, exciting, and forward-thinking.

  OUTPUT:
  - The complete rewritten JD.
  - A short summary of what was fixed.
  - An estimated quality score before and after.
  `,
});

const aiImproveJobDescriptionFlow = ai.defineFlow(
  {
    name: 'aiImproveJobDescriptionFlow',
    inputSchema: AIImproveJobDescriptionInputSchema,
    outputSchema: AIImproveJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
