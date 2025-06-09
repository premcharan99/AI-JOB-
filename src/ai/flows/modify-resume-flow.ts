
'use server';
/**
 * @fileOverview AI agent that modifies a resume based on a job description and suggestions, and then re-analyzes it.
 *
 * - modifyResumeAndAnalyze - A function that handles the resume modification and re-analysis process.
 * - ModifyResumeInput - The input type for the modifyResumeAndAnalyze function.
 * - ModifyResumeOutput - The return type for the modifyResumeAndAnalyze function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalyzeResumeOutput } from './analyze-resume-flow'; // Only import the type

const ModifyResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description text.'),
  originalResumeText: z.string().describe('The original resume text to be modified.'),
  analysisSuggestions: z.string().describe('Suggestions from a previous analysis to guide the modification.'),
});
export type ModifyResumeInput = z.infer<typeof ModifyResumeInputSchema>;

// Define KeywordAnalysisSchema locally as it's part of AnalyzeResumeOutput's structure
// and AnalyzeResumeOutputSchema is no longer exported.
const KeywordAnalysisSchema = z.object({
  jobDescriptionKeywords: z.array(z.string()).describe("A list of important keywords and skills extracted from the job description."),
  presentInResume: z.array(z.string()).describe("Keywords from the job description that are also found in the resume."),
  missingFromResume: z.array(z.string()).describe("Important keywords from the job description that appear to be missing from the resume."),
}).describe("Detailed keyword analysis comparing the resume to the job description.");

// Define LocalAnalyzeResumeOutputSchema locally to represent the structure of an analysis result.
const LocalAnalyzeResumeOutputSchema = z.object({
  matchScore: z.string().describe('The calculated match score between the resume and job description (e.g., "85% Match", "Strong Match").'),
  suggestions: z.string().describe('Actionable suggestions to improve the resume for the given job description, formatted as a bulleted list. Aim for 4-5 concise key points if suggestions are provided.'),
  keywords: KeywordAnalysisSchema,
});

const ModifyResumeOutputSchema = z.object({
  modifiedResumeText: z.string().describe("The full text of the revised resume."),
  newAnalysis: LocalAnalyzeResumeOutputSchema.describe("The analysis (match score, suggestions, keywords) for the modified resume."),
});
export type ModifyResumeOutput = z.infer<typeof ModifyResumeOutputSchema>;

export async function modifyResumeAndAnalyze(input: ModifyResumeInput): Promise<ModifyResumeOutput> {
  return modifyResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'modifyResumePrompt',
  input: {schema: ModifyResumeInputSchema},
  output: {schema: ModifyResumeOutputSchema},
  prompt: `You are an expert resume editor and career coach.
Given the following:
1. Job Description: {{{jobDescription}}}
2. Original Resume Text: {{{originalResumeText}}}
3. Suggestions for Improvement (based on a previous analysis of the original resume against the job description): {{{analysisSuggestions}}}

Your tasks are:
A. Revise the Original Resume Text. Incorporate the 'Suggestions for Improvement' and ensure the resume is highly tailored to the 'Job Description'. Focus on:
    - Integrating missing keywords from the job description.
    - Rephrasing experience to highlight relevant achievements.
    - Ensuring professional language and formatting.
    Output the full text of this revised resume as 'modifiedResumeText'.

B. After revising the resume, analyze this NEWLY MODIFIED resume against the ORIGINAL 'Job Description'. For this new analysis (to be returned in the 'newAnalysis' object), provide:
    - A match score (e.g., "90% Match", "Excellent Match") as 'matchScore'.
    - Actionable suggestions for any further minor improvements, if any, as 'suggestions'. If providing suggestions, keep them concise (around 4-5 bullet points).
    - Keyword analysis (as a 'keywords' object):
        - 'jobDescriptionKeywords': Important keywords and skills extracted from the job description.
        - 'presentInResume': Keywords from the job description that are found in the MODIFIED resume.
        - 'missingFromResume': Important keywords from the job description that appear to be missing from the MODIFIED resume.

Return the 'modifiedResumeText' and the 'newAnalysis' object containing 'matchScore', 'suggestions', and 'keywords' in the specified output format.`,
});

const modifyResumeFlow = ai.defineFlow(
  {
    name: 'modifyResumeFlow',
    inputSchema: ModifyResumeInputSchema,
    outputSchema: ModifyResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
