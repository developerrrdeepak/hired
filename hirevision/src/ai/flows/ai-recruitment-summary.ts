'use server';

/**
 * @fileOverview Generates a summary of the recruiting efforts over the last week.
 *
 * - generateRecruitmentSummary - A function that generates the recruitment summary.
 * - RecruitmentSummaryInput - The input type for the generateRecruitmentSummary function.
 * - RecruitmentSummaryOutput - The return type for the generateRecruitmentSummary function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const RecruitmentSummaryInputSchema = z.object({
  timeRange: z
    .string()
    .default('last week')
    .describe('The time range for the recruitment summary.'),
  stats: z.object({
      jobsPosted: z.number().optional(),
      newCandidates: z.number().optional(),
      interviewsConducted: z.number().optional(),
      offersExtended: z.number().optional()
  }).optional().describe("Actual recruitment metrics to base the summary on.")
});
export type RecruitmentSummaryInput = z.infer<typeof RecruitmentSummaryInputSchema>;

const RecruitmentSummaryOutputSchema = z.object({
  headline: z.string().describe("A catchy title for the summary."),
  summary: z.string().describe('A professional narrative summary of the recruiting efforts.'),
  keyMetrics: z.array(z.string()).describe("Bulleted list of key performance indicators highlighted."),
  nextWeekFocus: z.string().describe("Strategic suggestion for where to focus next.")
});
export type RecruitmentSummaryOutput = z.infer<typeof RecruitmentSummaryOutputSchema>;

export async function generateRecruitmentSummary(input: RecruitmentSummaryInput): Promise<RecruitmentSummaryOutput> {
  return recruitmentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recruitmentSummaryPrompt',
  input: {schema: RecruitmentSummaryInputSchema},
  output: {schema: RecruitmentSummaryOutputSchema},
  model: geminiPro,
  prompt: `Act as a Head of Talent Acquisition. Generate a weekly status update.
  
  TIME RANGE: {{{timeRange}}}
  
  DATA (Simulated if missing):
  - Jobs Posted: {{stats.jobsPosted}}
  - New Candidates: {{stats.newCandidates}}
  - Interviews: {{stats.interviewsConducted}}
  - Offers: {{stats.offersExtended}}

  TASK:
  1.  **Headline**: Professional and status-aware (e.g., "Strong Candidate Flow for Engineering Roles").
  2.  **Narrative**: Summarize the activity. Was it a busy week? Did we hit bottlenecks?
  3.  **Metrics**: Highlight the most important numbers.
  4.  **Strategy**: Suggest a primary focus for the upcoming week based on the data flow.

  Keep it brief and executive-ready.
`,
});

const recruitmentSummaryFlow = ai.defineFlow(
  {
    name: 'recruitmentSummaryFlow',
    inputSchema: RecruitmentSummaryInputSchema,
    outputSchema: RecruitmentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

