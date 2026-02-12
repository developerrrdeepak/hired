'use server';

/**
 * @fileOverview An AI agent that generates advanced Boolean search strings.
 *
 * - aiBooleanSearch - A function that creates search strings for various platforms.
 * - AiBooleanSearchInput - The input type for the function.
 * - AiBooleanSearchOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const AiBooleanSearchInputSchema = z.object({
  jobTitle: z.string().describe("The job title to search for."),
  requiredSkills: z.array(z.string()).describe("Must-have technical skills."),
  optionalSkills: z.array(z.string()).optional().describe("Nice-to-have skills."),
  location: z.string().optional().describe("Target geographic location."),
  platforms: z.array(z.enum(['LinkedIn', 'Google', 'GitHub', 'StackOverflow'])).describe("Platforms to generate strings for."),
});
export type AiBooleanSearchInput = z.infer<typeof AiBooleanSearchInputSchema>;

const SearchStringSchema = z.object({
    platform: z.string(),
    query: z.string().describe("The copy-pasteable search string."),
    explanation: z.string().describe("Brief explanation of the logic used."),
});

const AiBooleanSearchOutputSchema = z.object({
  searchStrings: z.array(SearchStringSchema).describe("List of generated search strings."),
  sourcingTips: z.array(z.string()).describe("Tactical tips for sourcing this specific role."),
});
export type AiBooleanSearchOutput = z.infer<typeof AiBooleanSearchOutputSchema>;


export async function aiBooleanSearch(input: AiBooleanSearchInput): Promise<AiBooleanSearchOutput> {
  return aiBooleanSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiBooleanSearchPrompt',
  input: { schema: AiBooleanSearchInputSchema },
  output: { schema: AiBooleanSearchOutputSchema },
  model: geminiPro,
  prompt: `Act as a Master Sourcer and Boolean Search Expert.

  ROLE: {{{jobTitle}}}
  MUST HAVE: {{#each requiredSkills}}{{this}}, {{/each}}
  LOCATION: {{{location}}}

  TASK:
  Generate highly optimized Boolean search strings for the requested platforms.
  
  GUIDELINES:
  1.  **LinkedIn**: Use standard operators (AND, OR, NOT, parenthesis). Include variations of job titles.
  2.  **Google (X-Ray)**: Use 'site:linkedin.com/in' or 'site:github.com' etc. Exclude job boards if possible.
  3.  **GitHub**: Focus on 'language:', 'location:', and readme contents.
  
  Also provide 3 advanced sourcing tips specific to finding {{{jobTitle}}} talent (e.g., specific conferences to look for, alternative job titles).`,
});

const aiBooleanSearchFlow = ai.defineFlow(
  {
    name: 'aiBooleanSearchFlow',
    inputSchema: AiBooleanSearchInputSchema,
    outputSchema: AiBooleanSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

