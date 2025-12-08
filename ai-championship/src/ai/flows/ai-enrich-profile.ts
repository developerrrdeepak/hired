
'use server';

/**
 * @fileOverview An AI agent that enriches a candidate's profile from raw text.
 *
 * - aiEnrichProfile - A function that takes raw text (like a resume) and returns a structured profile.
 * - AiEnrichProfileInput - The input type for the function.
 * - AiEnrichProfileOutput - The return type for the function.
 */

import {ai, geminiFlash} from '@/ai/genkit';
import {z} from 'genkit';
import { Education, Experience, Link } from '@/lib/definitions';

const AiEnrichProfileInputSchema = z.object({
  rawText: z.string().describe("The full text content of the candidate's resume or profile."),
});
export type AiEnrichProfileInput = z.infer<typeof AiEnrichProfileInputSchema>;

const ExperienceSchema = z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string().describe("The start date, preferably in YYYY-MM format."),
    endDate: z.string().optional().describe("The end date, preferably in YYYY-MM format, or 'Present'."),
    description: z.string().optional().describe("A concise summary of responsibilities, focusing on achievements."),
});

const EducationSchema = z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional(),
    startYear: z.string().describe("The start year."),
    endYear: z.string().optional().describe("The end year or expected graduation year."),
});

const LinkSchema = z.object({
    name: z.string().describe("The name of the platform (e.g., LinkedIn, GitHub, Portfolio)."),
    url: z.string().url(),
});

const AiEnrichProfileOutputSchema = z.object({
  summary: z.string().describe("A comprehensive professional summary (approx 100 words) highlighting expertise and seniority."),
  headline: z.string().optional().describe("A catchy one-line professional headline."),
  skills: z.array(z.string()).describe("A comprehensive list of technical and soft skills."),
  experience: z.array(ExperienceSchema).describe("A structured list of the candidate's work experience."),
  education: z.array(EducationSchema).describe("A structured list of the candidate's education history."),
  links: z.array(LinkSchema).describe("A list of relevant web links like portfolio or social profiles."),
  location: z.string().optional().describe("Inferred current location/city."),
});
export type AiEnrichProfileOutput = z.infer<typeof AiEnrichProfileOutputSchema>;


export async function aiEnrichProfile(input: AiEnrichProfileInput): Promise<AiEnrichProfileOutput> {
  return aiEnrichProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiEnrichProfilePrompt',
  input: {schema: AiEnrichProfileInputSchema},
  output: {schema: AiEnrichProfileOutputSchema},
  model: geminiFlash,
  prompt: `Act as a Professional Resume Parser and Career Profiler.

  INPUT TEXT:
  ---
  {{{rawText}}}
  ---

  INSTRUCTIONS:
  1.  **Extract & Standardize**: Parse all employment and education details. Convert dates to YYYY-MM.
  2.  **Generate Summary**: If a summary exists, refine it to be more impactful. If not, generate a professional executive summary based on the experience.
  3.  **Infer Metadata**: Deduce the candidate's likely current location and a professional headline (e.g., "Senior Full Stack Engineer | Cloud Architecture Enthusiast").
  4.  **Skill Extraction**: Capture all technical tools, languages, and soft skills mentioned.
  
  Ensure high accuracy in entity extraction (Company names, Job Titles).`,
});

const aiEnrichProfileFlow = ai.defineFlow(
  {
    name: 'aiEnrichProfileFlow',
    inputSchema: AiEnrichProfileInputSchema,
    outputSchema: AiEnrichProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
