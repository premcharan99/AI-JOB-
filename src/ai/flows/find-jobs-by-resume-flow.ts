
'use server';
/**
 * @fileOverview AI agent that finds suitable job listings based on a user's resume.
 *
 * - findJobsByResume - A function that handles the job finding process.
 * - FindJobsByResumeInput - The input type for the findJobsByResume function.
 * - FindJobsByResumeOutput - The return type for the findJobsByResume function.
 * - FoundJob - The type for an individual job listing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoundJobSchema = z.object({
  companyName: z.string().describe("The name of the hiring company (e.g., Google, Microsoft, Tech Solutions Inc.). Should be a well-known multinational corporation or a plausible product-based tech company name."),
  jobTitle: z.string().describe("The job title (e.g., Software Engineer, Product Manager, Data Analyst)."),
  jobDescription: z.string().describe("A concise job description (3-5 sentences) highlighting aspects that would match the provided resume. Should sound like a real job posting."),
  matchPercentage: z.string().describe("A simulated match percentage indicating how well the resume aligns with this generated job (e.g., '85% Match', 'Strong Fit')."),
  applyLink: z.string().url().or(z.literal('#')).describe("A placeholder or fictional application link for the job. Can be a generic link like 'https://company.com/careers/apply/job123' or '#' if a specific link isn't generated."),
});
export type FoundJob = z.infer<typeof FoundJobSchema>;

const FindJobsByResumeInputSchema = z.object({
  resumeDataUri: z.string().describe("The user's resume file (PDF), as a data URI that must include a MIME type (application/pdf) and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type FindJobsByResumeInput = z.infer<typeof FindJobsByResumeInputSchema>;

const FindJobsByResumeOutputSchema = z.object({
  jobs: z.array(FoundJobSchema).describe("An array of 3 to 5 suitable job listings generated based on the resume."),
});
export type FindJobsByResumeOutput = z.infer<typeof FindJobsByResumeOutputSchema>;

export async function findJobsByResume(input: FindJobsByResumeInput): Promise<FindJobsByResumeOutput> {
  return findJobsByResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findJobsByResumePrompt',
  input: {schema: FindJobsByResumeInputSchema},
  output: {schema: FindJobsByResumeOutputSchema},
  prompt: `You are a sophisticated AI career assistant. Your task is to analyze the provided resume and generate a list of 3 to 5 suitable job opportunities.
These job opportunities should appear as if they are from well-known multinational corporations (MNCs) or reputable product-based technology companies.

Resume:
{{media url=resumeDataUri}}

Based on the content of this resume, please generate plausible job listings. For each job:
1.  **Company Name**: Generate a realistic and recognizable company name (e.g., Amazon, Salesforce, Oracle, or a convincing fictional product-based tech company name like "Innovatech" or "QuantumLeap AI").
2.  **Job Title**: Create a suitable job title that aligns with the skills and experience in the resume.
3.  **Job Description**: Write a brief (3-5 sentences) but compelling job description. This description should highlight key responsibilities and required skills that specifically resonate with the strengths evident in the provided resume. Make it sound like a genuine job posting.
4.  **Match Percentage**: Provide a qualitative or quantitative assessment of how well the resume matches this generated job (e.g., "90% Match", "Excellent Fit", "Strong Candidate Potential").
5.  **Apply Link**: Generate a plausible but placeholder application URL (e.g., "https://examplecompany.com/careers/job-title-123" or a generic "#apply-now"). If generating a URL, make it look realistic but not a real, active link.

Return an array of 3 to 5 such job listings in the specified output format. Ensure diversity in the types of roles and companies if the resume supports it. Focus on quality and realism for each generated job.
If the resume is very generic or lacks clear indicators for specific roles, try to generate roles that are generally in demand in the tech sector for which some common skills might apply.
`,
});

const findJobsByResumeFlow = ai.defineFlow(
  {
    name: 'findJobsByResumeFlow',
    inputSchema: FindJobsByResumeInputSchema,
    outputSchema: FindJobsByResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure we always return an array, even if the AI fails to produce one.
    if (!output || !Array.isArray(output.jobs)) {
        return { jobs: [] };
    }
    return output;
  }
);
