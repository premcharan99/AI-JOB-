
'use server';
/**
 * @fileOverview AI agent that analyzes a resume against a job description.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeywordAnalysisSchema = z.object({
  jobDescriptionKeywords: z.array(z.string()).describe("A list of important keywords and skills extracted from the job description."),
  presentInResume: z.array(z.string()).describe("Keywords from the job description that are also found in the resume."),
  missingFromResume: z.array(z.string()).describe("Important keywords from the job description that appear to be missing from the resume."),
}).describe("Detailed keyword analysis comparing the resume to the job description.");

const AnalyzeResumeOutputSchema = z.object({
  matchScore: z.string().describe('The calculated match score between the resume and job description (e.g., "85% Match", "Strong Match").'),
  suggestions: z.string().describe('Actionable suggestions to improve the resume for the given job description, formatted as a bulleted list or detailed paragraph.'),
  keywords: KeywordAnalysisSchema,
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;


const AnalyzeResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description text.'),
  resumeText: z.string().describe('The resume text.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;


export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert HR professional and resume reviewer.
Given the following job description and resume:

Job Description:
{{{jobDescription}}}

Resume:
{{{resumeText}}}

Please perform the following tasks:
1.  Calculate a match score representing how well the resume aligns with the job description. Express this as a percentage (e.g., "85% Match") or a qualitative assessment (e.g., "Strong Match", "Moderate Match", "Weak Match").
2.  Provide actionable suggestions to improve the resume to better fit this specific job description. Focus on highlighting relevant skills, tailoring experience descriptions, and incorporating keywords from the job description. Format suggestions as a clear, actionable list, preferably bulleted.
3.  Perform a keyword analysis:
    a.  Extract the most important keywords and skills from the Job Description. Store this in 'jobDescriptionKeywords'.
    b.  Identify which of these keywords are present in the Resume. Store this in 'presentInResume'.
    c.  List important keywords from the Job Description that are NOT found in the Resume. Store this in 'missingFromResume'.

Return ONLY the match score, suggestions, and the keyword analysis object in the specified output format.`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
