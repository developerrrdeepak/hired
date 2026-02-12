
'use server';

/**
 * @fileOverview An AI agent that summarizes interview feedback.
 *
 * - aiSummarizeFeedback - A function that takes feedback from multiple interviewers and creates a consolidated summary.
 * - AiSummarizeFeedbackInput - The input type for the function.
 * - AiSummarizeFeedbackOutput - The return type for the function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewerFeedbackSchema = z.object({
    interviewerName: z.string().describe("The name of the interviewer."),
    rating: z.number().describe("The overall rating the interviewer gave, from 1 to 5."),
    pros: z.string().describe("The strengths or positive points noted by the interviewer."),
    cons: z.string().describe("The weaknesses or concerns noted by the interviewer."),
    verdict: z.string().describe("The final recommendation from the interviewer (e.g., 'Hire', 'No Hire').")
});

const AiSummarizeFeedbackInputSchema = z.object({
  jobTitle: z.string().describe("The job title the candidate is being considered for."),
  candidateName: z.string().describe("The name of the candidate."),
  feedbacks: z.array(InterviewerFeedbackSchema).describe("An array of feedback objects from each interviewer."),
});
export type AiSummarizeFeedbackInput = z.infer<typeof AiSummarizeFeedbackInputSchema>;

const AiSummarizeFeedbackOutputSchema = z.object({
  overallSummary: z.string().describe("A professional hiring brief synthesizing all data."),
  aggregatedScore: z.number().describe("Calculated average weighted score (1-5)."),
  keyStrengths: z.array(z.string()).describe("Consensus areas of excellence."),
  keyWeaknesses: z.array(z.string()).describe("Consensus areas of concern."),
  conflictingSignals: z.array(z.string()).describe("Disagreements between interviewers requiring debrief discussion."),
  finalRecommendation: z.enum(['Strong Hire', 'Hire', 'Leaning Hire', 'Leaning No Hire', 'No Hire']).describe("AI computed verdict."),
  decisionRationale: z.string().describe("Justification for the recommendation.")
});
export type AiSummarizeFeedbackOutput = z.infer<typeof AiSummarizeFeedbackOutputSchema>;


export async function aiSummarizeFeedback(input: AiSummarizeFeedbackInput): Promise<AiSummarizeFeedbackOutput> {
  return aiSummarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSummarizeFeedbackPrompt',
  input: {schema: AiSummarizeFeedbackInputSchema},
  output: {schema: AiSummarizeFeedbackOutputSchema},
  model: geminiPro,
  prompt: `Act as a Hiring Committee Secretary. Synthesize the interview panel's feedback into a decision document.

  CANDIDATE: {{{candidateName}}}
  ROLE: {{{jobTitle}}}

  FEEDBACK DATA:
  ---
  {{#each feedbacks}}
  [Interviewer: {{this.interviewerName}} | Score: {{this.rating}}/5 | Verdict: {{this.verdict}}]
  PROS: {{this.pros}}
  CONS: {{this.cons}}
  ---
  {{/each}}

  ANALYSIS:
  1.  **Consolidate**: Identify patterns. If 3 people say "Good communication", that's a Key Strength.
  2.  **Highlight Conflicts**: If one says "Technical Expert" and another says "Weak Coding", flag it.
  3.  **Compute Verdict**: Weigh "Strong Hires" heavily. Provide a final recommendation based on the consensus.

  Tone: Objective, decisive, and clear.`,
});

const aiSummarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'aiSummarizeFeedbackFlow',
    inputSchema: AiSummarizeFeedbackInputSchema,
    outputSchema: AiSummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

