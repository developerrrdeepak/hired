'use server';

/**
 * @fileOverview An AI agent that performs a skill gap analysis.
 *
 * - aiSkillGapAnalysis - A function that identifies missing skills and suggests learning resources.
 * - AiSkillGapAnalysisInput - The input type for the function.
 * - AiSkillGapAnalysisOutput - The return type for the function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'zod';

const AiSkillGapAnalysisInputSchema = z.object({
  currentSkills: z.array(z.string()).describe("List of skills the candidate currently possesses."),
  targetRole: z.string().describe("The job title or role the candidate is aiming for."),
  targetJobDescription: z.string().optional().describe("The specific job description (optional but recommended)."),
});
export type AiSkillGapAnalysisInput = z.infer<typeof AiSkillGapAnalysisInputSchema>;

const LearningResourceSchema = z.object({
    title: z.string().describe("Title of the course, book, or article."),
    type: z.enum(['Course', 'Book', 'Article', 'Project', 'Certification']).describe("Type of resource."),
    estimatedTime: z.string().describe("Estimated time to complete (e.g., '4 weeks', '10 hours')."),
    description: z.string().describe("Brief description of what will be learned."),
});

const GapAnalysisSchema = z.object({
    missingSkill: z.string().describe("The specific skill that is missing or needs improvement."),
    importance: z.enum(['Critical', 'High', 'Medium', 'Nice-to-have']).describe("How critical this skill is for the target role."),
    gapDescription: z.string().describe("Explanation of why this gap matters."),
    recommendedResources: z.array(LearningResourceSchema).describe("Suggested resources to bridge this gap."),
});

const AiSkillGapAnalysisOutputSchema = z.object({
  analysisSummary: z.string().describe("A high-level summary of the candidate's readiness."),
  readinessScore: z.number().describe("0-100 score indicating readiness for the role."),
  skillGaps: z.array(GapAnalysisSchema).describe("Detailed breakdown of missing skills."),
  projectIdea: z.string().describe("A practical project idea that would combine multiple missing skills."),
});
export type AiSkillGapAnalysisOutput = z.infer<typeof AiSkillGapAnalysisOutputSchema>;


export async function aiSkillGapAnalysis(input: AiSkillGapAnalysisInput): Promise<AiSkillGapAnalysisOutput> {
  return aiSkillGapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSkillGapAnalysisPrompt',
  input: { schema: AiSkillGapAnalysisInputSchema },
  output: { schema: AiSkillGapAnalysisOutputSchema },
  model: geminiPro,
  prompt: `Act as a Senior Technical Career Coach and Learning & Development Specialist.

  CANDIDATE CURRENT SKILLS:
  {{{currentSkills}}}

  TARGET ROLE: {{{targetRole}}}

  {{#if targetJobDescription}}
  TARGET JOB DESCRIPTION:
  ---
  {{{targetJobDescription}}}
  ---
  {{/if}}

  OBJECTIVE:
  Perform a detailed Gap Analysis to help this candidate transition into the target role.

  INSTRUCTIONS:
  1.  **Identify Gaps**: Compare current skills against industry standards (and the specific JD if provided) for the target role.
  2.  **Prioritize**: Distinguish between 'Critical' blockers and 'Nice-to-have' bonuses.
  3.  **Recommend Action**: For each gap, suggest high-quality, specific learning paths (e.g., "Coursera: Deep Learning Specialization" rather than just "Take a course").
  4.  **Capstone Project**: Propose one concrete "Portfolio Project" that would require the candidate to learn and apply the top 3 missing skills simultaneously.

  Provide a structured, encouraging, and actionable roadmap.`,
});

const aiSkillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSkillGapAnalysisFlow',
    inputSchema: AiSkillGapAnalysisInputSchema,
    outputSchema: AiSkillGapAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
