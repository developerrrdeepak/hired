
'use server';

/**
 * @fileOverview An AI agent that generates a weekly summary for founders.
 *
 * - aiFounderWeeklySummary - A function that generates the weekly summary.
 * - AiFounderWeeklySummaryInput - The input type for the function.
 * - AiFounderWeeklySummaryOutput - The return type for the function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';


const AiFounderWeeklySummaryInputSchema = z.object({
  openRoles: z.number(),
  criticalRoles: z.array(z.object({ title: z.string() })),
  pipelineHealthScore: z.number(),
  hiringVelocityDays: z.number(),
  timeToHireDays: z.number(),
  funnelData: z.array(z.object({ stage: z.string(), count: z.number() })),
  bottleneckRoles: z.array(z.object({ title: z.string(), stage: z.string() })),
});

export type AiFounderWeeklySummaryInput = z.infer<typeof AiFounderWeeklySummaryInputSchema>;

const AiFounderWeeklySummaryOutputSchema = z.object({
  executiveSummary: z.string().describe("A high-level narrative summary of the week's performance."),
  keyObservations: z.array(z.string()).describe("Data-driven insights."),
  whatWentWell: z.array(z.string()).describe("Wins and improvements."),
  whatDidNot: z.array(z.string()).describe("Stalls and issues."),
  rolesAtRisk: z.array(z.string()).describe("Roles needing immediate attention."),
  founderActionItems: z.array(z.string()).describe("Strategic decisions or interventions required from the founder."),
});

export type AiFounderWeeklySummaryOutput = z.infer<typeof AiFounderWeeklySummaryOutputSchema>;


export async function aiFounderWeeklySummary(input: AiFounderWeeklySummaryInput): Promise<AiFounderWeeklySummaryOutput> {
    return aiFounderWeeklySummaryFlow(input);
}


const prompt = ai.definePrompt({
  name: 'aiFounderWeeklySummaryPrompt',
  input: {schema: AiFounderWeeklySummaryInputSchema },
  output: {schema: AiFounderWeeklySummaryOutputSchema},
  model: geminiPro,
  prompt: `Act as a Chief People Officer reporting to the Founder/CEO.
  
  DATA INPUT:
  - Open Roles: {{{openRoles}}}
  - Critical Priority: {{#each criticalRoles}}{{this.title}}, {{/each}}
  - Pipeline Score: {{{pipelineHealthScore}}}/100
  - Velocity: {{{hiringVelocityDays}}} days/stage
  - Time-to-Hire: {{{timeToHireDays}}} days (Avg)
  - Funnel: {{#each funnelData}} {{{this.stage}}}:{{{this.count}}} | {{/each}}
  - Bottlenecks: {{#each bottleneckRoles}} {{this.title}} @ {{this.stage}} | {{/each}}

  TASK:
  Synthesize this data into a "Founder's Weekly Hiring Brief".
  
  GUIDELINES:
  1.  **Executive Summary**: Is hiring accelerating, stalling, or stable? Why?
  2.  **Strategic Focus**: Highlight risks to critical path roles.
  3.  **Actionable Advice**: Tell the founder exactly where to intervene (e.g., "Review candidate X", "Approve budget for Y").

  Tone: Concise, Business-First, Solution-Oriented.`,
});


const aiFounderWeeklySummaryFlow = ai.defineFlow(
  {
    name: 'aiFounderWeeklySummaryFlow',
    inputSchema: AiFounderWeeklySummaryInputSchema,
    outputSchema: AiFounderWeeklySummaryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
