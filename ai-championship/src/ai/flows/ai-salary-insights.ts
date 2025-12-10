'use server';

/**
 * @fileOverview An AI agent that provides salary insights and negotiation data.
 *
 * - aiSalaryInsights - A function that estimates salary ranges and provides negotiation points.
 * - AiSalaryInsightsInput - The input type for the function.
 * - AiSalaryInsightsOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const AiSalaryInsightsInputSchema = z.object({
  role: z.string(),
  location: z.string(),
  experienceLevel: z.string().describe("e.g. Junior, Mid-Level, Senior, Staff"),
  companyType: z.enum(['Startup', 'Enterprise', 'Agency', 'Non-profit']).optional(),
});
export type AiSalaryInsightsInput = z.infer<typeof AiSalaryInsightsInputSchema>;

const AiSalaryInsightsOutputSchema = z.object({
  estimatedRange: z.object({
      min: z.string(),
      max: z.string(),
      median: z.string(),
      currency: z.string(),
  }),
  marketTrends: z.array(z.string()).describe("Current market conditions (e.g., 'High demand', 'Remote premiums')."),
  negotiationLevers: z.array(z.string()).describe("Non-monetary perks to negotiate (e.g., Equity, Sign-on, Remote)."),
  costOfLivingFactor: z.string().describe("Context on how the location affects this range."),
});
export type AiSalaryInsightsOutput = z.infer<typeof AiSalaryInsightsOutputSchema>;


export async function aiSalaryInsights(input: AiSalaryInsightsInput): Promise<AiSalaryInsightsOutput> {
  return aiSalaryInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSalaryInsightsPrompt',
  input: { schema: AiSalaryInsightsInputSchema },
  output: { schema: AiSalaryInsightsOutputSchema },
  model: geminiPro,
  prompt: `Act as a Compensation Analyst. Provide data-driven salary insights.

  ROLE: {{{role}}}
  LOCATION: {{{location}}}
  LEVEL: {{{experienceLevel}}}
  TYPE: {{{companyType}}}

  ESTIMATION LOGIC:
  Based on general market knowledge up to 2024/2025.
  
  OUTPUT:
  1.  **Range**: A realistic Base Salary range.
  2.  **Trends**: What is happening in the market for this specific role? (e.g., "AI Engineers seeing 20% premiums").
  3.  **Levers**: What else can be negotiated for this specific role type?
  
  Be conservative and realistic.`,
});

const aiSalaryInsightsFlow = ai.defineFlow(
  {
    name: 'aiSalaryInsightsFlow',
    inputSchema: AiSalaryInsightsInputSchema,
    outputSchema: AiSalaryInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
