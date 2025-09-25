'use server';

import { summarizeIdForVerification } from '@/ai/flows/summarize-id-for-verification';
import { verifyIdAuthenticity } from '@/ai/flows/verify-id-authenticity';
import type { SummarizeIdForVerificationOutput, VerifyIdAuthenticityInput, VerifyIdAuthenticityOutput } from '@/lib/types';


export async function getVerificationSummary(idDataUri: string): Promise<SummarizeIdForVerificationOutput> {
  if (!idDataUri) {
    throw new Error('ID data URI is required.');
  }

  try {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await summarizeIdForVerification({ idDataUri });
    return result;
  } catch (error) {
    console.error('Error getting verification summary:', error);
    // In a real app, you'd want more robust error handling and logging.
    throw new Error('Failed to generate summary from AI. Please try again.');
  }
}

export async function getAuthenticityReport(input: VerifyIdAuthenticityInput): Promise<VerifyIdAuthenticityOutput> {
  if (!input.idDataUri) {
    throw new Error('ID data URI is required.');
  }

  try {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await verifyIdAuthenticity(input);
    return result;
  } catch (error) {
    console.error('Error getting authenticity report:', error);
    // In a real app, you'd want more robust error handling and logging.
    throw new Error('Failed to generate authenticity report from AI. Please try again.');
  }
}
