import { z } from 'zod';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Awaiting Guest';

// Represents an individual guest whose ID is uploaded.
export type Guest = {
  id: string;
  guestNumber: number; // e.g., Guest 1, Guest 2
  idDocumentUrl?: string;
  idDocumentAiHint?: string;
  status: 'Pending' | 'Approved' | 'Rejected'; // Status of this specific ID
  verificationSummary?: string;
  verificationIssues?: string;
};

// Represents the overall submission created by the hotel owner.
export type Submission = {
  id: string;
  userId: string; // The ID of the user who created this submission
  propertyId: string; // The ID of the property this submission belongs to
  propertyName: string; // The name of the property
  bookingId: string;
  mainGuestName: string;
  mainGuestPhoneNumber: string;
  numberOfGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  termsAndConditions: string;
  status: SubmissionStatus;
  guests: Guest[]; // Array of individual guests
  createdAt?: Date;
  updatedAt?: Date;
};


// Schema for summarizeIdForVerification flow
export const SummarizeIdForVerificationInputSchema = z.object({
  idDataUri: z
    .string()
    .describe(
      "A photo or PDF of a guest's ID, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeIdForVerificationInput = z.infer<typeof SummarizeIdForVerificationInputSchema>;

export const SummarizeIdForVerificationOutputSchema = z.object({
  summary: z.string().describe('A summary of the key information on the ID.'),
  potentialIssues: z.string().describe('Any potential issues with the ID, such as expiration or inconsistencies.'),
});
export type SummarizeIdForVerificationOutput = z.infer<typeof SummarizeIdForVerificationOutputSchema>;


// Schema for verifyIdAuthenticity flow
export const VerifyIdAuthenticityInputSchema = z.object({
  idDataUri: z
    .string()
    .describe(
      "A photo of the ID document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  idType: z.enum(['Passport', 'Driving License', 'Aadhar'])
    .describe('The type of the ID document being verified.'),
});
export type VerifyIdAuthenticityInput = z.infer<typeof VerifyIdAuthenticityInputSchema>;

export const VerifyIdAuthenticityOutputSchema = z.object({
  isAuthentic: z.boolean().describe('A boolean indicating if the ID appears to be authentic.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score between 0 and 1 for the authenticity assessment.'),
  reasoning: z.string().describe('A detailed reasoning for the authenticity assessment.'),
  extractedData: z.object({
    name: z.string().optional().describe('Extracted full name from the ID.'),
    dateOfBirth: z.string().optional().describe('Extracted date of birth from the ID (YYYY-MM-DD).'),
    idNumber: z.string().optional().describe('Extracted ID number (e.g., passport number, license number).'),
    expiryDate: z.string().optional().describe('Extracted expiry date from the ID (YYYY-MM-DD), if available.'),
  }).describe('Key information extracted from the ID document.'),
});
export type VerifyIdAuthenticityOutput = z.infer<typeof VerifyIdAuthenticityOutputSchema>;


// Property Schema
export const propertySchema = z.object({
  name: z.string().min(3, { message: "Property name must be at least 3 characters." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  contactPhone: z.string().min(10, { message: "A valid phone number is required." }),
  logo: z.any().optional(),
});
export type Property = {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  contactPhone: string;
  logoUrl?: string;
  createdAt: Date | string;
  subscription_id?: string;
  subscription_status?: 'active' | 'inactive';
  subscription_start_date?: any;
  subscription_end_date?: any;
}

// User Profile
export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  createdAt: any;
  updatedAt?: Date;
  properties: Property[];
  isAdmin?: boolean;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profileVisible: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
}
