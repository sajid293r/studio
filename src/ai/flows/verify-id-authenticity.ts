'use server';
/**
 * @fileOverview A Genkit flow to verify the authenticity of an ID document.
 *
 * - verifyIdAuthenticity - A function that analyzes an ID for authenticity.
 */

import {ai} from '@/ai/genkit';
import { VerifyIdAuthenticityInputSchema, VerifyIdAuthenticityOutputSchema, type VerifyIdAuthenticityInput } from '@/lib/types';


export async function verifyIdAuthenticity(input: VerifyIdAuthenticityInput) {
  return verifyIdAuthenticityFlow(input);
}

const prompt = ai.definePrompt({
    name: 'verifyIdAuthenticityPrompt',
    input: { schema: VerifyIdAuthenticityInputSchema },
    output: { schema: VerifyIdAuthenticityOutputSchema },
    prompt: `You are a highly-trained digital forensics expert specializing in identity document verification. Your task is to analyze the provided ID document and determine its authenticity.

You are given an ID of type: {{{idType}}}.

Analyze the following document:
{{media url=idDataUri}}

Carefully examine the document for any signs of tampering, forgery, or inconsistencies. Check for:
- Font consistency and alignment.
- Holograms, watermarks, and other security features expected for a {{{idType}}}.
- Photo quality and signs of substitution.
- Data consistency (e.g., does the age calculated from the DOB match the person's appearance?).
- Overall layout and comparison to a known genuine template for a {{{idType}}}.

Based on your analysis, provide the following:
1.  **Authenticity Decision**: Conclude whether the ID is authentic or likely fraudulent.
2.  **Confidence Score**: Provide a score from 0.0 (no confidence) to 1.0 (full confidence) in your assessment.
3.  **Reasoning**: Detail your findings. If you flag it as not authentic, explain exactly why. Mention specific anomalies you detected. If it looks authentic, explain which security features appear correct.
4.  **Extracted Data**: Extract the key information from the document.
`
});


const verifyIdAuthenticityFlow = ai.defineFlow(
  {
    name: 'verifyIdAuthenticityFlow',
    inputSchema: VerifyIdAuthenticityInputSchema,
    outputSchema: VerifyIdAuthenticityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
