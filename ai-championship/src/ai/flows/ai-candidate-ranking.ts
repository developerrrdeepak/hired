'use server';

/**
 * @fileOverview A candidate ranking AI agent.
 *
 * - aiCandidateRanking - A function that handles the candidate ranking process.
 * - AiCandidateRankingInput - The input type for the aiCandidateRanking function.
 * - AiCandidateRankingOutput - The return type for the aiCandidateRanking function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const AiCandidateRankingInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description for which the candidate will be ranked.'),
  candidateResume: z
    .string()
    .describe('The text content of the candidate resume.'),
});
export type AiCandidateRankingInput = z.infer<typeof AiCandidateRankingInputSchema>;

const AiCandidateRankingOutputSchema = z.object({
  fitScore: z.number().describe('A score from 0-100 indicating how well the candidate fits the job description.'),
  reasoning: z.string().describe('A detailed justification for the assigned fit score.'),
  matchingSkills: z.array(z.string()).describe('List of skills found in both JD and Resume'),
  missingSkills: z.array(z.string()).describe('Key skills required but not found in Resume'),
});

export type AiCandidateRankingOutput = z.infer<typeof AiCandidateRankingOutputSchema>;

export async function aiCandidateRanking(input: AiCandidateRankingInput): Promise<AiCandidateRankingOutput> {
  return aiCandidateRankingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCandidateRankingPrompt',
  input: {schema: AiCandidateRankingInputSchema},
  output: {schema: AiCandidateRankingOutputSchema},
  model: geminiPro,
  prompt: `Act as a specialized Talent Assessment AI. Quantify the compatibility between the candidate and the job role.

  JOB DESCRIPTION:
  ---
  {{{jobDescription}}}
  ---

  CANDIDATE RESUME:
  ---
  {{{candidateResume}}}
  ---

  SCORING CRITERIA:
  - 90-100: Exceptional Match (Exceeds requirements)
  - 80-89: Strong Match (Meets all key requirements)
  - 70-79: Good Match (Meets most requirements, minor gaps)
  - <70: Weak Match

  OUTPUT REQUIREMENTS:
  1. **Fit Score**: 0-100. Be strict.
  2. **Reasoning**: A professional paragraph explaining the score logic.
  3. **Matching Skills**: Extract exact skill keywords present in both.
  4. **Missing Skills**: Identify critical skills listed in JD but absent in Resume.

  Analyze deeply.
`,
});

const aiCandidateRankingFlow = ai.defineFlow(
  {
    name: 'aiCandidateRankingFlow',
    inputSchema: AiCandidateRankingInputSchema,
    outputSchema: AiCandidateRankingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
