
'use server';

/**
 * @fileOverview An AI agent that analyzes a candidate's resume.
 *
 * - aiAnalyzeCandidate - A function that analyzes a resume and provides a structured summary.
 * - AiAnalyzeCandidateInput - The input type for the function.
 * - AiAnalyzeCandidateOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const AiAnalyzeCandidateInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the candidate's resume."),
});
export type AiAnalyzeCandidateInput = z.infer<typeof AiAnalyzeCandidateInputSchema>;

const ProfileJsonSchema = z.object({
    summary: z.string().describe("A professional executive summary of the candidate."),
    skills: z.array(z.string()).describe("A comprehensive list of technical and soft skills."),
    strengths: z.array(z.string()).describe("Key selling points and competitive advantages."),
    risks: z.array(z.string()).describe("Potential concerns (e.g., short tenure, skill gaps)."),
    seniorityLevel: z.string().describe("Estimated seniority (e.g., Junior, Mid-Level, Senior, Lead)."),
    recommendedRoles: z.array(z.string()).describe("Job titles this candidate is best suited for."),
});

const AiAnalyzeCandidateOutputSchema = z.object({
  aiProfileJson: z.string().describe(`A JSON string containing the structured analysis.`),
});
export type AiAnalyzeCandidateOutput = z.infer<typeof AiAnalyzeCandidateOutputSchema>;


export async function aiAnalyzeCandidate(input: AiAnalyzeCandidateInput): Promise<AiAnalyzeCandidateOutput> {
  return aiAnalyzeCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAnalyzeCandidatePrompt',
  input: {schema: AiAnalyzeCandidateInputSchema},
  output: {schema: ProfileJsonSchema},
  model: geminiPro,
  prompt: `Act as a Senior Talent Assessor. Conduct a deep-dive analysis of the provided resume text.

  RESUME CONTENT:
  {{{resumeText}}}

  OBJECTIVES:
  1.  **Summary**: Write a compelling narrative summary of their career trajectory.
  2.  **Strengths**: Identify unique value propositions.
  3.  **Risks**: Flag any employment gaps, frequent job changes, or vague descriptions tactfully.
  4.  **Leveling**: Estimate their seniority based on years of experience and scope of responsibility.
  5.  **Placement**: Suggest 3-5 specific job titles they would excel in.

  Ensure the output is strictly professional and objective.`,
});

const aiAnalyzeCandidateFlow = ai.defineFlow(
  {
    name: 'aiAnalyzeCandidateFlow',
    inputSchema: AiAnalyzeCandidateInputSchema,
    outputSchema: AiAnalyzeCandidateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        aiProfileJson: JSON.stringify(output)
    };
  }
);

