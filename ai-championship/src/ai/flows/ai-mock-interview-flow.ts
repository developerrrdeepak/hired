
'use server';

/**
 * @fileOverview An AI agent that conducts a mock interview.
 *
 * - mockInterview - A function that takes conversation history and a job type, and returns the next interview question.
 */

import { ai, geminiPro } from '@/ai/genkit';
import {
    MockInterviewInput,
    MockInterviewInputSchema,
    MockInterviewOutput,
    MockInterviewOutputSchema
} from '@/lib/interview-types';


export async function mockInterview(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: { schema: MockInterviewInputSchema },
  output: { schema: MockInterviewOutputSchema },
  model: geminiPro,
  config: {
    temperature: 0.7, // Balanced for creativity and focus
    topP: 0.9,
    topK: 40,
  },
  prompt: `You are an expert Interviewer conducting a professional mock interview for a {{jobType}} role.
Your persona is supportive but rigorous, aiming to help the candidate practice for real-world scenarios.

GOAL:
Assess the candidate's technical skills, problem-solving abilities, and cultural fit through a structured dialogue.

CONVERSATION HISTORY:
---
{{#if history.length}}
{{#each history}}
{{this.speaker}}: {{this.text}}
{{/each}}
{{else}}
(No history yet - Start of Interview)
{{/if}}
---

INSTRUCTIONS:
1.  **Opening**: If history is empty, introduce yourself briefly as their AI Interviewer and ask the first question (e.g., "Tell me about yourself").
2.  **Follow-up**: If the user has answered, analyze their response.
    *   If vague, ask a clarifying question.
    *   If solid, acknowledge briefly (e.g., "Understood," "Interesting point") and pivot to the next core competency.
3.  **Questioning Strategy**:
    *   Mix Behavioral (STAR method) and Technical questions appropriate for a {{jobType}}.
    *   **Ask only ONE question at a time.**
4.  **Closing**: If the conversation has covered 5-6 substantial exchanges, thank the candidate and offer a brief summary of their performance before ending.
5.  **Tone**: Professional, encouraging, concise. avoid repetitive phrases like "That's great."

Provide the next conversational turn.`,
});

const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
