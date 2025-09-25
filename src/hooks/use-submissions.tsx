"use client";

import { useState, useEffect } from 'react';
import type { Submission } from '@/lib/types';
import { useAuth } from './use-auth';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/submissions?userId=${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSubmission = async (submissionData: Omit<Submission, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionData,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create submission');
      }

      const newSubmission = await response.json();
      setSubmissions(prev => [newSubmission, ...prev]);
      return newSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create submission');
      throw err;
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission');
      }

      const updatedSubmission = await response.json();
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? updatedSubmission : sub)
      );
      return updatedSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
      throw err;
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
      throw err;
    }
  };

  const deleteSubmissions = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteSubmission(id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submissions');
      throw err;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  return {
    submissions,
    loading,
    error,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    deleteSubmissions,
    refetch: fetchSubmissions,
  };
}
