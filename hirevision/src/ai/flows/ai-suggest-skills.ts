'use server';

/**
 * @fileOverview AI agent that suggests skills for a job description.
 *
 * - suggestSkills - A function that suggests skills for a job description.
 * - SuggestSkillsInput - The input type for the suggestSkills function.
 * - SuggestSkillsOutput - The return type for the suggestSkills function.
 */

import {ai, geminiFlash} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSkillsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The description of the job to suggest skills for.'),
});
export type SuggestSkillsInput = z.infer<typeof SuggestSkillsInputSchema>;

const SuggestSkillsOutputSchema = z.object({
  suggestedSkills: z
    .array(z.string())
    .describe('The skills suggested for the job description.'),
  categories: z
    .object({
        technical: z.array(z.string()),
        soft: z.array(z.string()),
        tools: z.array(z.string())
    })
    .optional()
    .describe('Categorized skills breakdown'),
});
export type SuggestSkillsOutput = z.infer<typeof SuggestSkillsOutputSchema>;

export async function suggestSkills(
  input: SuggestSkillsInput
): Promise<SuggestSkillsOutput> {
  return suggestSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSkillsPrompt',
  input: {schema: SuggestSkillsInputSchema},
  output: {schema: SuggestSkillsOutputSchema},
  model: geminiFlash,
  prompt: `Analyze the provided Job Description to extract and infer the most relevant professional skills.
  
  JOB DESCRIPTION:
  ---
  {{{jobDescription}}}
  ---
  
  TASK:
  1. Identify core competencies required for success in this role.
  2. Differentiate between Hard Skills (Technical), Soft Skills (Behavioral), and specific Tools/Platforms.
  3. Return a clean, de-duplicated list of the top 15-20 skills.
  
  Ensure the skills are industry-standard terms (e.g., "React.js" instead of "React", "Stakeholder Management" instead of "Managing people").
  `,
});

const suggestSkillsFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFlow',
    inputSchema: SuggestSkillsInputSchema,
    outputSchema: SuggestSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

