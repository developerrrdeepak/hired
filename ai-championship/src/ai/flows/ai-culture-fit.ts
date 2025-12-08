
'use server';

/**
 * @fileOverview An AI agent that analyzes cultural fit between a candidate and a job.
 *
 * - aiCultureFit - A function that provides a short summary of cultural alignment.
 * - AiCultureFitInput - The input type for the function.
 * - AiCultureFitOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCultureFitInputSchema = z.object({
  jobDescription: z.string().describe("The full text of the job description, including company values if available."),
  candidateResume: z.string().describe("The full text of the candidate's resume."),
});
export type AiCultureFitInput = z.infer<typeof AiCultureFitInputSchema>;

const AiCultureFitOutputSchema = z.object({
  cultureFitSummary: z.string().describe("A professional analysis of cultural alignment."),
  alignmentScore: z.number().describe("0-100 score of estimated cultural match."),
  positiveSignals: z.array(z.string()).describe("Phrases or experiences indicating good fit."),
  potentialConcerns: z.array(z.string()).describe("Areas where values might diverge."),
});
export type AiCultureFitOutput = z.infer<typeof AiCultureFitOutputSchema>;


export async function aiCultureFit(input: AiCultureFitInput): Promise<AiCultureFitOutput> {
  return aiCultureFitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCultureFitPrompt',
  input: {schema: AiCultureFitInputSchema},
  output: {schema: AiCultureFitOutputSchema},
  prompt: `Act as an Organizational Psychologist and Culture Specialist. Analyze the implicit and explicit signals in the provided texts.

  JOB CONTEXT:
  ---
  {{{jobDescription}}}
  ---

  CANDIDATE PROFILE:
  ---
  {{{candidateResume}}}
  ---

  ANALYSIS FRAMEWORK:
  1.  **Values Decoding**: Identify the core values of the company (e.g., Innovation, Stability, Collaboration, Autonomy) from the JD.
  2.  **Behavioral Mapping**: Look for evidence of these values in the candidate's past roles, achievements, and writing style.
  3.  **Environment Match**: Compare the candidate's previous work environments (Startup vs. Enterprise) with the target role.

  OUTPUT:
  - **Summary**: A balanced, nuanced paragraph.
  - **Score**: An estimated 0-100 alignment index.
  - **Signals**: Specific examples backing your assessment.

  Be objective and rely on textual evidence.
`,
});

const aiCultureFitFlow = ai.defineFlow(
  {
    name: 'aiCultureFitFlow',
    inputSchema: AiCultureFitInputSchema,
    outputSchema: AiCultureFitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
