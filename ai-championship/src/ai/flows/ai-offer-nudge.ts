
'use server';

/**
 * @fileOverview An AI agent that provides suggestions to make a job offer more competitive.
 *
 * - aiOfferNudge - A function that generates "nudges" or suggestions for a job offer.
 * - AiOfferNudgeInput - The input type for the function.
 * - AiOfferNudgeOutput - The return type for the function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const AiOfferNudgeInputSchema = z.object({
  jobTitle: z.string().describe("The title of the job."),
  seniorityLevel: z.string().describe("The seniority level for the role (e.g., Junior, Senior, Lead)."),
  requiredSkills: z.array(z.string()).describe("A list of key required skills for the job."),
  location: z.string().describe("The job location (e.g., 'Remote', 'New York, NY')."),
  currentMinSalary: z.number().optional().describe("The current minimum salary for the offer, if any."),
  currentMaxSalary: z.number().optional().describe("The current maximum salary for the offer, if any."),
  industry: z.string().optional().describe("The industry sector (e.g., Fintech, HealthTech)."),
});
export type AiOfferNudgeInput = z.infer<typeof AiOfferNudgeInputSchema>;

const NudgeSchema = z.object({
    category: z.enum(['Salary', 'Equity', 'Benefits', 'Flexibility', 'Growth', 'Sign-on']).describe("The lever to pull."),
    suggestion: z.string().describe("Actionable advice (e.g., 'Increase base by 5%')."),
    marketInsight: z.string().describe("Why? (e.g., 'Senior React devs in NYC average $160k')."),
    impactScore: z.enum(['High', 'Medium', 'Low']).describe("Estimated impact on acceptance rate."),
});

const AiOfferNudgeOutputSchema = z.object({
  marketContext: z.string().describe("Brief analysis of the current market for this role."),
  nudges: z.array(NudgeSchema).describe("Strategic suggestions to close the candidate."),
});
export type AiOfferNudgeOutput = z.infer<typeof AiOfferNudgeOutputSchema>;

export async function aiOfferNudge(input: AiOfferNudgeInput): Promise<AiOfferNudgeOutput> {
  return aiOfferNudgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiOfferNudgePrompt',
  input: {schema: AiOfferNudgeInputSchema},
  output: {schema: AiOfferNudgeOutputSchema},
  model: geminiPro,
  prompt: `Act as a Compensation Consultant. Analyze the competitiveness of a job offer for a {{seniorityLevel}} {{jobTitle}}.
  
  CONTEXT:
  - Location: {{location}}
  - Skills: {{#each requiredSkills}}{{this}}, {{/each}}
  - Salary Offer: {{#if currentMinSalary}}${{currentMinSalary}} - ${{currentMaxSalary}}{{else}}Not specified{{/if}}
  
  TASK:
  1.  **Market Context**: Provide a quick read on the market demand for this specific profile in this location.
  2.  **Strategic Nudges**: Recommend 3-4 specific improvements to the offer package to maximize acceptance probability. Consider non-monetary levers if salary is fixed.
  
  Be data-informed and persuasive.`,
});

const aiOfferNudgeFlow = ai.defineFlow(
  {
    name: 'aiOfferNudgeFlow',
    inputSchema: AiOfferNudgeInputSchema,
    outputSchema: AiOfferNudgeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
