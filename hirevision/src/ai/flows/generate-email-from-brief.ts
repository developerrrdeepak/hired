
// src/ai/flows/generate-email-from-brief.ts
'use server';
/**
 * @fileOverview Generates an email template from a brief description.
 *
 * - generateEmailFromBrief - A function that generates an email template based on a given brief.
 * - GenerateEmailFromBriefInput - The input type for the generateEmailFromBrief function.
 * - GenerateEmailFromBriefOutput - The return type for the generateEmailFromBrief function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailFromBriefInputSchema = z.object({
  brief: z.string().describe('A brief description of the email to generate, including context like candidate name and job title.'),
  tone: z.enum(['Professional', 'Friendly', 'Formal', 'Empathetic', 'Direct']).optional().describe('Desired tone of the email.'),
});
export type GenerateEmailFromBriefInput = z.infer<
  typeof GenerateEmailFromBriefInputSchema
>;

const GenerateEmailFromBriefOutputSchema = z.object({
  subject: z.string().describe('The generated email subject line.'),
  body: z.string().describe('The generated email body content.'),
  previewText: z.string().describe('A short snippet for email client previews.'),
});
export type GenerateEmailFromBriefOutput = z.infer<
  typeof GenerateEmailFromBriefOutputSchema
>;

export async function generateEmailFromBrief(
  input: GenerateEmailFromBriefInput
): Promise<GenerateEmailFromBriefOutput> {
  return generateEmailFromBriefFlow(input);
}

const generateEmailFromBriefPrompt = ai.definePrompt({
  name: 'generateEmailFromBriefPrompt',
  input: {schema: GenerateEmailFromBriefInputSchema},
  output: {schema: GenerateEmailFromBriefOutputSchema},
  model: geminiPro,
  prompt: `Act as a Senior Communication Manager. Draft a high-quality email based on the brief.
  
  BRIEF: {{{brief}}}
  TONE: {{#if tone}}{{{tone}}}{{else}}Professional{{/if}}

  REQUIREMENTS:
  1.  **Subject**: Engaging and clear (under 50 chars ideally).
  2.  **Structure**: Salutation -> Context -> Core Message -> Call to Action -> Sign-off.
  3.  **Clarity**: Avoid jargon. Be concise.

  Generate the Subject, Body, and a Preview Text line.`,
});

const generateEmailFromBriefFlow = ai.defineFlow(
  {
    name: 'generateEmailFromBriefFlow',
    inputSchema: GenerateEmailFromBriefInputSchema,
    outputSchema: GenerateEmailFromBriefOutputSchema,
  },
  async input => {
    const {output} = await generateEmailFromBriefPrompt(input);
    return output!;
  }
);

