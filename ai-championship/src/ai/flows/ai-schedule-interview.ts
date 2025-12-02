import { aif, genkit } from '@genkit-ai/ai';
import { flow } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai';
import * as z from 'zod';

const InterviewSchedulingRequestSchema = z.object({
  candidateEmail: z.string().email().describe('Email address of the candidate'),
  interviewerEmail: z.string().email().describe('Email address of the interviewer'),
  jobTitle: z.string().describe('The title of the job the candidate is interviewing for'),
});

const InterviewSchedulingOutputSchema = z.object({
  emailSubject: z.string().describe('The subject of the email to be sent to the candidate'),
  emailBody: z.string().describe('The body of the email to be sent to the candidate'),
});

export const scheduleInterviewFlow = flow(
  {
    name: 'scheduleInterview',
    inputSchema: InterviewSchedulingRequestSchema,
    outputSchema: InterviewSchedulingOutputSchema,
  },
  async (request) => {
    const prompt = `
      As an expert recruitment coordinator, your task is to write a friendly and professional email to a candidate to schedule an interview.

      The candidate's email is: ${request.candidateEmail}
      The interviewer's email is: ${request.interviewerEmail}
      The job title is: ${request.jobTitle}

      The email should:
      1. Congratulate the candidate on moving to the interview stage.
      2. Propose a video interview for the position of ${request.jobTitle}.
      3. Ask the candidate to provide their availability for the next week.
      4. Mention that the interview will be with the hiring manager (${request.interviewerEmail}).
      5. Keep the tone warm and professional.

      Generate a subject and body for this email.
    `;

    const llmResponse = await genkit.generate({
      prompt,
      model: geminiPro,
      output: {
        schema: InterviewSchedulingOutputSchema,
      },
      config: {
        temperature: 0.5,
      },
    });

    const email = llmResponse.output();
    if (!email) {
      throw new Error('Failed to generate interview scheduling email.');
    }

    return email;
  }
);
