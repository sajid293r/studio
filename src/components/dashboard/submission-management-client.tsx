'use client';

import * as React from 'react';
import type { Submission } from '@/lib/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableToolbar } from './data-table-toolbar';
import { useAuth } from '@/hooks/use-auth';
import { useSubmissions } from '@/hooks/use-submissions';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';

interface SubmissionManagementClientProps {
  initialSubmissions: Submission[];
  selectedSubmissionId?: string | null;
  onSubmissionSelected?: (submissionId: string | null) => void;
}

export function SubmissionManagementClient({ 
  initialSubmissions, 
  selectedSubmissionId, 
  onSubmissionSelected 
}: SubmissionManagementClientProps) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { 
    submissions, 
    createSubmission, 
    updateSubmission, 
    deleteSubmissions: deleteSubmissionsAPI,
    refetch 
  } = useSubmissions();
  const [selectedSubmissions, setSelectedSubmissions] = React.useState<Submission[]>([]);
  const [autoOpenSubmissionId, setAutoOpenSubmissionId] = React.useState<string | null>(null);

  // Handle auto-opening submission from email link
  React.useEffect(() => {
    if (selectedSubmissionId && submissions.length > 0) {
      const submission = submissions.find(s => s.id === selectedSubmissionId);
      if (submission) {
        setAutoOpenSubmissionId(selectedSubmissionId);
        // Clear the selected submission after a short delay
        setTimeout(() => {
          setAutoOpenSubmissionId(null);
          onSubmissionSelected?.(null);
        }, 100);
      }
    }
  }, [selectedSubmissionId, submissions, onSubmissionSelected]);

  const handleAddSubmission = async (newSubmission: Omit<Submission, 'id'>) => {
    try {
      await createSubmission(newSubmission);
      toast({
        title: "Submission Created",
        description: "New submission has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create submission. Please try again.",
      });
    }
  };

  const handleUpdateSubmission = async (updatedSubmission: Submission) => {
    try {
      console.log('Updating submission in database:', updatedSubmission.id);
      await updateSubmission(updatedSubmission.id, updatedSubmission);
      console.log('Submission updated successfully in database');
      toast({
        title: "Submission Updated",
        description: "Submission has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update submission in database:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission. Please try again.",
      });
    }
  };

  const handleDeleteSubmissions = async (submissionIds: string[]) => {
    try {
      await deleteSubmissionsAPI(submissionIds);
      setSelectedSubmissions([]);
      toast({
        title: "Submissions Deleted",
        description: `${submissionIds.length} submission(s) have been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submissions. Please try again.",
      });
    }
  };

  const handleDataCleanup = async () => {
    const sixtyDaysAgo = subDays(new Date(), 60);
    let cleanedCount = 0;

    const submissionsToClean = submissions.filter(submission => {
      const checkOutDate = submission.checkOutDate instanceof Date 
        ? submission.checkOutDate 
        : new Date(submission.checkOutDate);
      return checkOutDate < sixtyDaysAgo && submission.guests.some(g => g.idDocumentUrl);
    });

    try {
      for (const submission of submissionsToClean) {
        const cleanedGuests = submission.guests.map(guest => ({
          ...guest,
          idDocumentUrl: undefined,
          idDocumentAiHint: undefined,
          verificationSummary: 'Data Purged for Compliance',
          verificationIssues: 'Data Purged for Compliance',
          status: guest.status,
        }));

        await updateSubmission(submission.id, {
          guests: cleanedGuests,
        });

        cleanedCount++;
      }

      if (cleanedCount > 0) {
        toast({
          title: "Data Cleanup Complete",
          description: `Sensitive data from ${cleanedCount} old submission(s) has been purged.`,
          className: 'bg-green-600 text-white'
        });
      } else {
        toast({
          title: "No Data to Clean",
          description: "There are no submissions older than 60 days that require data purging.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: "Failed to clean up old data. Please try again.",
      });
    }
  };

  const submissionColumns = React.useMemo(
    () => columns({ 
      onUpdate: handleUpdateSubmission, 
      onDelete: (id) => handleDeleteSubmissions([id]),
      autoOpenSubmissionId: autoOpenSubmissionId
    }), 
    [autoOpenSubmissionId]
  );

  if (loading || !user) {
    return (
        <Card className="animate-fade-in shadow-soft">
            <CardHeader className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }


  return (
    <Card className="animate-fade-in shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
       <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Guest Submissions</CardTitle>
          <CardDescription className="text-lg font-medium text-muted-foreground">
            Create and manage pre-check-in submissions for your guests.
          </CardDescription>
        </div>
        <Button 
            variant="outline" 
            size="lg" 
            onClick={handleDataCleanup}
            className="transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 hover:shadow-lg hover:scale-105 font-semibold"
        >
            <Trash className="mr-3 h-5 w-5" />
            Clean Old Data
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
         <DataTable 
            columns={submissionColumns} 
            data={submissions} 
            onRowSelectionChange={setSelectedSubmissions} 
            toolbar={
                <DataTableToolbar
                    onAddSubmission={handleAddSubmission}
                    onDeleteSelected={() => handleDeleteSubmissions(selectedSubmissions.map(s => s.id))}
                />
            }
        />
      </CardContent>
    </Card>
  );
}
