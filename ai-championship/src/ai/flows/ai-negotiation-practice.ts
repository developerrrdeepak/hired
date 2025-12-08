import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '../genkit';

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
    const conversationHistory = history?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    const systemPrompt = `You are an experienced hiring manager conducting a salary negotiation practice session. The candidate is applying for: ${role}.

Your role:
- Challenge the candidate professionally
- Ask for justifications on salary expectations
- Present realistic counter-offers
- Provide constructive feedback
- Keep responses concise (2-3 sentences)

Be professional but firm in negotiations.`;

    const result = await geminiPro.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...conversationHistory,
        { role: 'user', parts: [{ text: userResponse }] }
      ],
    });

    return result.response.text();
  },
);
