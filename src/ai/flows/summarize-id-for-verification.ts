'use server';
/**
 * @fileOverview Summarizes key information and potential issues in an uploaded ID for admin verification.
 *
 * - summarizeIdForVerification - A function that summarizes the ID information for verification.
 */

import {ai} from '@/ai/genkit';
import { SummarizeIdForVerificationInputSchema, SummarizeIdForVerificationOutputSchema, type SummarizeIdForVerificationInput } from '@/lib/types';


export async function summarizeIdForVerification(input: SummarizeIdForVerificationInput) {
  return summarizeIdForVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIdForVerificationPrompt',
  input: {schema: SummarizeIdForVerificationInputSchema},
  output: {schema: SummarizeIdForVerificationOutputSchema},
  prompt: `You are an expert at quickly and accurately verifying identity documents.  Based on the uploaded ID, provide a summary of the key information (name, date of birth, etc.) and highlight any potential issues that would cause concern (expiration date, inconsistencies, signs of tampering, etc.).

ID: {{media url=idDataUri}}
\nProvide the summary and potential issues in separate sections.
\nSummary:
\nPotential Issues:`,
});

const summarizeIdForVerificationFlow = ai.defineFlow(
  {
    name: 'summarizeIdForVerificationFlow',
    inputSchema: SummarizeIdForVerificationInputSchema,
    outputSchema: SummarizeIdForVerificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
