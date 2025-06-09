
'use server';
/**
 * @fileOverview AI agent that generates a demo resume based on a job description and experience level.
 *
 * - generateDemoResume - A function that handles the demo resume generation process.
 * - GenerateDemoResumeInput - The input type for the generateDemoResume function.
 * - GenerateDemoResumeOutput - The return type for the generateDemoResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDemoResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description text.'),
  experienceLevel: z
    .enum(['fresher', 'intermediate', 'senior'])
    .describe('The desired experience level for the resume (fresher, intermediate, senior).'),
});
export type GenerateDemoResumeInput = z.infer<typeof GenerateDemoResumeInputSchema>;

const GenerateDemoResumeOutputSchema = z.object({
  demoResume: z.string().describe('The generated demo resume text.'),
});
export type GenerateDemoResumeOutput = z.infer<typeof GenerateDemoResumeOutputSchema>;

export async function generateDemoResume(input: GenerateDemoResumeInput): Promise<GenerateDemoResumeOutput> {
  return generateDemoResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDemoResumePrompt',
  input: {schema: GenerateDemoResumeInputSchema},
  output: {schema: GenerateDemoResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach.
Given the following job description and desired experience level, please generate a comprehensive and professional demo resume.

Job Description:
{{{jobDescription}}}

Experience Level: {{{experienceLevel}}}

The resume should include standard sections like:
- Contact Information (use realistic placeholder data like "John Doe", "john.doe@email.com", "(555) 123-4567", "City, State")
- Summary/Objective (tailored to the job and level)
- Experience (create plausible job titles, responsibilities, and achievements based on the job description and experience level. For 'fresher', focus on projects, internships, and skills. For 'intermediate', show 1-3 relevant roles with increasing responsibility over 3-7 years. For 'senior', demonstrate significant experience, leadership, and impact over 7+ years, possibly including multiple roles.)
- Education (use placeholder university names, degrees, and graduation years relevant to the experience level)
- Skills (a list of technical and soft skills relevant to the job description and experience level)

Ensure the resume is well-formatted, uses strong action verbs, and is clearly tailored to the provided job description and experience level.
Return ONLY the generated resume text. Make sure it's a complete resume.`,
});

const generateDemoResumeFlow = ai.defineFlow(
  {
    name: 'generateDemoResumeFlow',
    inputSchema: GenerateDemoResumeInputSchema,
    outputSchema: GenerateDemoResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
