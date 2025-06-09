// src/ai/flows/generate-summary-variations.ts
'use server';

/**
 * @fileOverview AI agent that summarizes content (text or URL) with variable length options.
 *
 * - generateSummaryWithVariableLength - A function that summarizes content based on desired length.
 * - GenerateSummaryWithVariableLengthInput - The input type for the generateSummaryWithVariableLength function.
 * - GenerateSummaryWithVariableLengthOutput - The return type for the generateSummaryWithVariableLength function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryWithVariableLengthInputSchema = z.object({
  content: z.string().describe('The content to be summarized, either text or a URL.'),
  length: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the summary: short, medium, or long.'),
});

export type GenerateSummaryWithVariableLengthInput = z.infer<
  typeof GenerateSummaryWithVariableLengthInputSchema
>;

const GenerateSummaryWithVariableLengthOutputSchema = z.object({
  summary: z.string().describe('The summarized content.'),
});

export type GenerateSummaryWithVariableLengthOutput = z.infer<
  typeof GenerateSummaryWithVariableLengthOutputSchema
>;

export async function generateSummaryWithVariableLength(
  input: GenerateSummaryWithVariableLengthInput
): Promise<GenerateSummaryWithVariableLengthOutput> {
  return generateSummaryWithVariableLengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryWithVariableLengthPrompt',
  input: {schema: GenerateSummaryWithVariableLengthInputSchema},
  output: {schema: GenerateSummaryWithVariableLengthOutputSchema},
  prompt: `You are an AI expert in content summarization. Please provide a summary of the following content, tailored to the specified length.

Content: {{{content}}}

Length: {{{length}}}

Summary:`,
});

const generateSummaryWithVariableLengthFlow = ai.defineFlow(
  {
    name: 'generateSummaryWithVariableLengthFlow',
    inputSchema: GenerateSummaryWithVariableLengthInputSchema,
    outputSchema: GenerateSummaryWithVariableLengthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
