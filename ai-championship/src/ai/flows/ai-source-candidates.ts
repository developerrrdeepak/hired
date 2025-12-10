'use server';
import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const SourceCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The full job description.'),
});
export type SourceCandidatesInput = z.infer<typeof SourceCandidatesInputSchema>;

const SourceCandidatesOutputSchema = z.object({
  sourcingPlan: z.string().describe('A high-level plan on where to find these candidates.'),
  keywords: z.array(z.string()).describe('A list of keywords to search for.'),
});
export type SourceCandidatesOutput = z.infer<typeof SourceCandidatesOutputSchema>;

export async function sourceCandidates(input: SourceCandidatesInput): Promise<SourceCandidatesOutput> {
    return sourceCandidatesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'sourceCandidatesPrompt',
    input: {schema: SourceCandidatesInputSchema},
    output: {schema: SourceCandidatesOutputSchema},
    prompt: `Act as a Senior Talent Sourcer. Create a sourcing strategy for the following role.
    
    Job Description:
    ---
    {{{jobDescription}}}
    ---
    
    Provide a sourcing plan and a list of keywords to search for.`,
});

const sourceCandidatesFlow = ai.defineFlow(
  {
    name: 'sourceCandidatesFlow',
    inputSchema: SourceCandidatesInputSchema,
    outputSchema: SourceCandidatesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
