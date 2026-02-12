'use server';

/**
 * @fileOverview An AI agent that generates a personalized onboarding plan.
 *
 * - aiOnboardingPlan - A function that creates a 30-60-90 day plan.
 * - AiOnboardingPlanInput - The input type for the function.
 * - AiOnboardingPlanOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const AiOnboardingPlanInputSchema = z.object({
  candidateName: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  startDate: z.string().optional(),
});
export type AiOnboardingPlanInput = z.infer<typeof AiOnboardingPlanInputSchema>;

const OnboardingPhaseSchema = z.object({
    phaseName: z.string().describe("e.g., 'First 30 Days: Learning & Discovery'"),
    goals: z.array(z.string()).describe("Key objectives for this phase."),
    tasks: z.array(z.string()).describe("Specific actionable tasks."),
    successMetrics: z.string().describe("How success will be measured at the end of this phase."),
});

const AiOnboardingPlanOutputSchema = z.object({
  welcomeMessage: z.string().describe("A warm, motivating welcome message for the new hire."),
  roadmap: z.array(OnboardingPhaseSchema).describe("The 30-60-90 day plan."),
  recommendedReading: z.array(z.string()).describe("General topics or types of documents they should read first."),
  keyStakeholders: z.array(z.string()).describe("Roles/Teams they should prioritize meeting (inferred from JD)."),
});
export type AiOnboardingPlanOutput = z.infer<typeof AiOnboardingPlanOutputSchema>;


export async function aiOnboardingPlan(input: AiOnboardingPlanInput): Promise<AiOnboardingPlanOutput> {
  return aiOnboardingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiOnboardingPlanPrompt',
  input: { schema: AiOnboardingPlanInputSchema },
  output: { schema: AiOnboardingPlanOutputSchema },
  model: geminiPro,
  prompt: `Act as an Onboarding Specialist and Engineering Manager. Create a robust 30-60-90 day onboarding plan for a new {{{jobTitle}}} named {{{candidateName}}}.

  JOB CONTEXT:
  ---
  {{{jobDescription}}}
  ---

  GOAL:
  Accelerate time-to-productivity and ensure long-term retention.

  STRUCTURE:
  1.  **30 Days**: Focus on culture, tools, code/product familiarity, and small wins.
  2.  **60 Days**: Focus on taking ownership of larger tasks, collaboration, and deeper understanding.
  3.  **90 Days**: Focus on autonomy, strategic contribution, and delivering a significant project.

  Also identify key relationships they need to build based on the cross-functional nature of the role described.`,
});

const aiOnboardingPlanFlow = ai.defineFlow(
  {
    name: 'aiOnboardingPlanFlow',
    inputSchema: AiOnboardingPlanInputSchema,
    outputSchema: AiOnboardingPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

