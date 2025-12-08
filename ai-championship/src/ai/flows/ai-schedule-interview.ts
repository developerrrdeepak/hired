'use server';

/**
 * @fileOverview An AI agent that schedules interviews.
 *
 * - aiScheduleInterview - A function that schedules an interview based on candidate and job details.
 * - AIScheduleInterviewInput - The input type for the function.
 * - AIScheduleInterviewOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'genkit';

const AIScheduleInterviewInputSchema = z.object({
  candidateName: z.string().describe('Name of the candidate'),
  interviewerName: z.string().describe('Name of the interviewer'),
  jobTitle: z.string().describe('The title of the job the candidate is interviewing for'),
  interviewType: z.enum(['Screening', 'Technical', 'Behavioral', 'Final']).default('Screening').describe('Type of interview'),
  duration: z.string().default('30 mins').describe('Duration of the interview'),
});
export type AIScheduleInterviewInput = z.infer<typeof AIScheduleInterviewInputSchema>;

const AIScheduleInterviewOutputSchema = z.object({
  emailSubject: z.string().describe('Professional email subject line'),
  emailBody: z.string().describe('The full email body formatted with line breaks.'),
  schedulingLinkText: z.string().optional().describe('Text to link to a calendar scheduling tool if suggested.'),
});
export type AIScheduleInterviewOutput = z.infer<typeof AIScheduleInterviewOutputSchema>;

export async function aiScheduleInterview(input: AIScheduleInterviewInput): Promise<AIScheduleInterviewOutput> {
  return aiScheduleInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiScheduleInterviewPrompt',
  input: { schema: AIScheduleInterviewInputSchema },
  output: { schema: AIScheduleInterviewOutputSchema },
  model: geminiPro,
  prompt: `Act as an Executive Recruitment Coordinator. Draft a high-touch invitation email for an interview.
  
  DETAILS:
  - Candidate: {{{candidateName}}}
  - Role: {{{jobTitle}}}
  - Stage: {{{interviewType}}} Interview
  - Interviewer: {{{interviewerName}}}
  - Duration: {{{duration}}}

  GUIDELINES:
  1.  **Subject Line**: Clear and exciting (e.g., "Interview Invitation: [Role] at [Company]").
  2.  **Opening**: Warmly congratulate them on progressing.
  3.  **Context**: Briefly explain what this interview stage entails (e.g., "This session will focus on...").
  4.  **Call to Action**: Direct them to book a time or provide availability.
  5.  **Tone**: Professional, respectful of their time, and welcoming.

  Ensure the formatting is clean and easy to read.`,
});

const aiScheduleInterviewFlow = ai.defineFlow(
  {
    name: 'aiScheduleInterviewFlow',
    inputSchema: AIScheduleInterviewInputSchema,
    outputSchema: AIScheduleInterviewOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
