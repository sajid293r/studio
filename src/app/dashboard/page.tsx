"use client";

import { SubmissionManagementClient } from '@/components/dashboard/submission-management-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useSubmissions } from '@/hooks/use-submissions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { LoaderCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { submissions, loading: submissionsLoading, error } = useSubmissions();

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center space-y-4">
          <LoaderCircle className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while submissions are loading
  if (submissionsLoading) {
    return (
      <DashboardLayout
        currentPage="dashboard"
        title="Dashboard"
        description="Manage your guest submissions and properties"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        currentPage="dashboard"
        title="Dashboard"
        description="Manage your guest submissions and properties"
      >
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <LoaderCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentPage="dashboard"
      title="Dashboard"
      description="Manage your guest submissions and properties"
    >
      <SubmissionManagementClient initialSubmissions={submissions} />
    </DashboardLayout>
  );
}
