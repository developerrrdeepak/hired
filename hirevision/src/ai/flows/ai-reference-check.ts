'use server';

/**
 * @fileOverview An AI agent that analyzes reference check notes and provides insights.
 *
 * - aiReferenceCheck - A function that analyzes reference check notes.
 * - AiReferenceCheckInput - The input type for the function.
 * - AiReferenceCheckOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const ReferenceNoteSchema = z.object({
    refereeName: z.string(),
    refereeTitle: z.string(),
    relationship: z.string(),
    notes: z.string(),
});

const AiReferenceCheckInputSchema = z.object({
  candidateName: z.string(),
  referenceNotes: z.array(ReferenceNoteSchema).describe("List of notes from reference calls."),
});
export type AiReferenceCheckInput = z.infer<typeof AiReferenceCheckInputSchema>;

const AiReferenceCheckOutputSchema = z.object({
  overallReliabilityScore: z.number().describe("0-100 score of candidate reliability based on feedback."),
  consistentStrengths: z.array(z.string()).describe("Strengths mentioned by multiple references."),
  flaggedConcerns: z.array(z.string()).describe("Potential issues or inconsistencies found."),
  managementAdvice: z.string().describe("Advice on how to best manage this candidate based on feedback."),
  hiringRecommendation: z.enum(['Strong Hire', 'Hire', 'Caution', 'Do Not Hire']),
});
export type AiReferenceCheckOutput = z.infer<typeof AiReferenceCheckOutputSchema>;


export async function aiReferenceCheck(input: AiReferenceCheckInput): Promise<AiReferenceCheckOutput> {
  return aiReferenceCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiReferenceCheckPrompt',
  input: { schema: AiReferenceCheckInputSchema },
  output: { schema: AiReferenceCheckOutputSchema },
  model: geminiPro,
  prompt: `Act as a Forensic HR Analyst. Review the reference check notes for candidate {{{candidateName}}}.

  REFERENCE NOTES:
  {{#each referenceNotes}}
  ---
  Referee: {{this.refereeName}} ({{this.refereeTitle}})
  Relationship: {{this.relationship}}
  Feedback: {{this.notes}}
  ---
  {{/each}}

  OBJECTIVES:
  1.  **Cross-Verification**: Look for consistent patterns in behavior and performance across different referees.
  2.  **Red Flag Detection**: Identify subtle cues of negativity, hesitation, or specific incidents of poor performance.
  3.  **Management Guide**: Based on their work style described, suggest how a future manager should lead them (e.g., "Needs autonomy," "Requires frequent feedback").

  Provide a candid and protective assessment for the hiring company.`,
});

const aiReferenceCheckFlow = ai.defineFlow(
  {
    name: 'aiReferenceCheckFlow',
    inputSchema: AiReferenceCheckInputSchema,
    outputSchema: AiReferenceCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

