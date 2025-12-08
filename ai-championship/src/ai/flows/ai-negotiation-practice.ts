
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { geminiPro } from '../../ai/genkit';

export const negotiationPracticeFlow = defineFlow(
  {
    name: 'negotiationPracticeFlow',
    inputSchema: z.object({
      role: z.string(),
      userResponse: z.string(),
      history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })).optional(),
    }),
    outputSchema: z.string(),
  },
  async ({ role, userResponse, history }) => {
    const prompt = `You are a helpful AI assistant acting as a hiring manager in a salary negotiation practice session. The candidate is applying for the role of ${role}. Your goal is to challenge the candidate, ask for justifications for their salary expectations, and respond realistically. You can present counter-offers. The candidate just said: "${userResponse}"`;

    const response = await generate({
      model: geminiPro,
      prompt: prompt,
      history: history,
    });

    return response.text();
  },
);
