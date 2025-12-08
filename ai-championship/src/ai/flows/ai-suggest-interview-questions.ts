'use server';

/**
 * @fileOverview An AI agent that suggests interview questions based on a job description.
 *
 * - aiSuggestInterviewQuestions - A function that suggests questions.
 * - AiSuggestInterviewQuestionsInput - The input type for the function.
 * - AiSuggestInterviewQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSuggestInterviewQuestionsInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z
    .string()
    .describe('The full job description.'),
});
export type AiSuggestInterviewQuestionsInput = z.infer<typeof AiSuggestInterviewQuestionsInputSchema>;

const AiSuggestInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('A list of suggested interview questions.'),
});
export type AiSuggestInterviewQuestionsOutput = z.infer<typeof AiSuggestInterviewQuestionsOutputSchema>;

export async function aiSuggestInterviewQuestions(
  input: AiSuggestInterviewQuestionsInput
): Promise<AiSuggestInterviewQuestionsOutput> {
  return aiSuggestInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSuggestInterviewQuestionsPrompt',
  input: {schema: AiSuggestInterviewQuestionsInputSchema},
  output: {schema: AiSuggestInterviewQuestionsOutputSchema},
  prompt: `Act as a Senior HR Consultant specializing in Competency-Based Interviewing.
  
  JOB TITLE: {{{jobTitle}}}

  JOB DESCRIPTION:
  ---
  {{{jobDescription}}}
  ---

  TASK:
  Generate a curated list of 7 high-impact interview questions designed to rigorously assess a candidate's fit for this specific role.
  
  REQUIREMENTS:
  1.  **Technical Proficiency**: 2 questions testing core hard skills required in the description.
  2.  **Behavioral Competence**: 2 questions using the STAR method (Situation, Task, Action, Result) to assess past performance.
  3.  **Problem Solving**: 1 scenario-based question relevant to the role's challenges.
  4.  **Cultural Fit**: 1 question to gauge alignment with the implied work environment.
  5.  **Soft Skills**: 1 question targeting communication or leadership abilities.

  Ensure questions are open-ended and professional.
`,
});

const aiSuggestInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'aiSuggestInterviewQuestionsFlow',
    inputSchema: AiSuggestInterviewQuestionsInputSchema,
    outputSchema: AiSuggestInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
