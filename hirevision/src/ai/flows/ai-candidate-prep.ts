
'use server';

/**
 * @fileOverview An AI agent that provides feedback on a candidate's resume for a target role.
 *
 * - aiCandidatePrep - A function that analyzes a resume and provides a summary, suggested roles, and improvement tips.
 * - AICandidatePrepInput - The input type for the function.
 * - AICandidatePrepOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const AICandidatePrepInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the candidate's resume."),
  targetRole: z.string().describe("The job title or role the candidate is targeting."),
});
export type AICandidatePrepInput = z.infer<typeof AICandidatePrepInputSchema>;

const AICandidatePrepOutputSchema = z.object({
  summary: z.string().describe("A professional profile summary."),
  suggestedRoles: z.array(z.string()).describe("A list of 3-5 alternative or similar job titles that might be a good fit."),
  improvementTips: z.array(z.string()).describe("Detailed actionable advice to optimize the resume."),
  keywordsToInclude: z.array(z.string()).describe("Specific industry keywords missing from the resume."),
});
export type AICandidatePrepOutput = z.infer<typeof AICandidatePrepOutputSchema>;


export async function aiCandidatePrep(input: AICandidatePrepInput): Promise<AICandidatePrepOutput> {
  return aiCandidatePrepFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCandidatePrepPrompt',
  input: { schema: AICandidatePrepInputSchema },
  output: { schema: AICandidatePrepOutputSchema },
  model: geminiPro,
  prompt: `Act as a Senior Career Strategist helping a candidate land a role as a "{{{targetRole}}}".

  RESUME:
  ---
  {{{resumeText}}}
  ---

  TASK:
  Provide a strategic review of the resume to maximize interview chances for the target role.

  OUTPUTS:
  1.  **Summary**: A concise, punchy version of their professional narrative (2-3 sentences).
  2.  **Role Expansion**: Suggest 3-5 alternative titles (e.g., if "Software Engineer", suggest "Full Stack Developer" or "Backend Specialist" based on skills).
  3.  **Optimization Tactics**: 3-5 high-impact changes. Be specific (e.g., "Change bullet 2 to quantify the impact in revenue").
  4.  **Keyword Strategy**: Identify 5-7 crucial ATS (Applicant Tracking System) keywords for a "{{{targetRole}}}" that are currently missing or weak in their resume.

  Tone: Encouraging, authoritative, and tactical.`,
});

const aiCandidatePrepFlow = ai.defineFlow(
  {
    name: 'aiCandidatePrepFlow',
    inputSchema: AICandidatePrepInputSchema,
    outputSchema: AICandidatePrepOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

