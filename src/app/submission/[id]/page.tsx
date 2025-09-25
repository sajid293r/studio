import { SubmissionForm } from "./submission-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

type SubmissionPageProps = {
    params: Promise<{
        id: string;
    }>
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
    const { id } = await params;
    
    try {
        // Fetch submission from Firebase
        const submissionRef = doc(db, 'submissions', id);
        const submissionSnap = await getDoc(submissionRef);
        
        if (!submissionSnap.exists()) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-muted/40">
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Submission Not Found</AlertTitle>
                        <AlertDescription>
                            The submission link you followed is invalid or has expired. Please contact the hotel for a new link.
                            <div className="mt-4">
                                <Button asChild>
                                    <Link href="/">Return to Dashboard</Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )
        }

        const submission = { id: submissionSnap.id, ...submissionSnap.data() } as Submission;
        return <SubmissionForm submission={submission} />
    } catch (error) {
        console.error('Error fetching submission:', error);
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Submission</AlertTitle>
                    <AlertDescription>
                        There was an error loading the submission. Please try again later.
                        <div className="mt-4">
                            <Button asChild>
                                <Link href="/">Return to Dashboard</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
}
