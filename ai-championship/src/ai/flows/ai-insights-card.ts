'use server';

/**
 * @fileOverview An AI insights card generator for the dashboard.
 *
 * - generateDashboardInsights - A function that generates insights for the dashboard.
 * - GenerateDashboardInsightsInput - The input type for the generateDashboardInsights function.
 * - GenerateDashboardInsightsOutput - The return type for the generateDashboardInsights function.
 */

import {ai, geminiFlash} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDashboardInsightsInputSchema = z.object({
  // In a real scenario, we would pass actual stats here
  userRole: z.string().optional().describe('The role of the user (e.g., Recruiter, Hiring Manager).'),
  period: z.string().optional().describe('Time period for analysis (e.g., "This Week").'),
});
export type GenerateDashboardInsightsInput = z.infer<
  typeof GenerateDashboardInsightsInputSchema
>;

const GenerateDashboardInsightsOutputSchema = z.object({
  summary: z.string().describe('A high-level executive summary of the current hiring health.'),
  actionItems: z.array(z.string()).describe('Specific, actionable recommendations (e.g., "Follow up with 3 pending candidates").'),
  trendAnalysis: z.string().describe('Brief observation on trends (e.g., "Application volume is up 20%").'),
});
export type GenerateDashboardInsightsOutput = z.infer<
  typeof GenerateDashboardInsightsOutputSchema
>;

export async function generateDashboardInsights(
  input: GenerateDashboardInsightsInput
): Promise<GenerateDashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: {schema: GenerateDashboardInsightsInputSchema},
  output: {schema: GenerateDashboardInsightsOutputSchema},
  model: geminiFlash,
  prompt: `Act as a Data-Driven Recruitment Analyst. Generate simulated but realistic insights for a recruitment dashboard.

  CONTEXT:
  User Role: {{userRole}}
  Period: {{period}}

  TASK:
  Provide a concise "State of Hiring" update.
  1.  **Summary**: One impactful sentence about overall pipeline health.
  2.  **Action Items**: 3 critical tasks the user should prioritize right now to unblock hiring.
  3.  **Trend Analysis**: A positive or neutral observation about process efficiency or candidate quality.

  Keep it motivational and professional.`,
});

const generateDashboardInsightsFlow = ai.defineFlow(
  {
    name: 'generateDashboardInsightsFlow',
    inputSchema: GenerateDashboardInsightsInputSchema,
    outputSchema: GenerateDashboardInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
