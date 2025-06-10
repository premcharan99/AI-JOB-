
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
  companyName: z.string().describe("The name of the hiring company. This should be one of the following: Amazon, DBS, Adobe, Microsoft, NCR, Micron, Flipkart, Salesforce, Uber, Servicenow, ADP."),
  jobTitle: z.string().describe("The job title (e.g., Software Engineer, Product Manager, Data Analyst)."),
  jobDescription: z.string().describe("A concise job description (3-5 sentences) highlighting aspects that would match the provided resume. Should sound like a real job posting from the specified company."),
  matchPercentage: z.string().describe("A simulated match percentage indicating how well the resume aligns with this generated job (e.g., '85% Match', 'Strong Fit')."),
  applyLink: z.string().describe("A placeholder or fictional application link for the job. Generate a realistic-looking URL for the specified company's career page (e.g., 'https://company.com/careers/apply/job123'), or use '#' if a specific link cannot be plausibly generated."),
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
These job opportunities should be simulated as if they are from a specific list of well-known multinational corporations (MNCs) or reputable product-based technology companies.

Resume:
{{media url=resumeDataUri}}

Based on the content of this resume, please generate plausible job listings. For each job:
1.  **Company Name**: Choose a company name EXCLUSIVELY from the following list: Amazon, DBS, Adobe, Microsoft, NCR, Micron, Flipkart, Salesforce, Uber, Servicenow, ADP.
2.  **Job Title**: Create a suitable job title that aligns with the skills and experience in the resume and would be appropriate for the chosen company.
3.  **Job Description**: Write a brief (3-5 sentences) but compelling job description. This description should highlight key responsibilities and required skills that specifically resonate with the strengths evident in the provided resume. Make it sound like a genuine job posting from the chosen company.
4.  **Match Percentage**: Provide a qualitative or quantitative assessment of how well the resume matches this generated job (e.g., "90% Match", "Excellent Fit", "Strong Candidate Potential").
5.  **Apply Link**: Generate a plausible but placeholder application URL (e.g., "https://amazon.jobs/en/jobs/xxxxx" or "https://careers.microsoft.com/us/en/job/xxxxx"). If you cannot generate a realistic-looking URL for the specific company, use "#" as the apply link.

Return an array of 3 to 5 such job listings in the specified output format. Ensure diversity in the types of roles if the resume supports it, but always stick to the provided company list. Focus on quality and realism for each generated job, making it appear as if it's a real opening from one of the specified companies.
If the resume is very generic or lacks clear indicators for specific roles, try to generate roles that are generally in demand in the tech sector for which some common skills might apply, fitting them to one of the companies in the list.
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

