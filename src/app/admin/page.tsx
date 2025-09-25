"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getAllUsers } from '../lib/user-actions';
import type { UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!userProfile?.isAdmin) {
        router.push('/dashboard');
      } else {
        getAllUsers().then(allUsers => {
            setUsers(allUsers);
            setUsersLoading(false);
        });
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !userProfile?.isAdmin) {
    return (
      <DashboardLayout
        currentPage="admin"
        title="Admin Dashboard"
        description="Manage users and system settings"
      >
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>
        <div className="h-[600px] w-full bg-muted animate-pulse rounded-xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentPage="admin"
      title="Admin Dashboard"
      description="Manage users and system settings"
    >
      <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">User Management</CardTitle>
            <CardDescription className="text-lg font-medium text-muted-foreground">View and manage all registered users on the Stay Verify platform.</CardDescription>
            </div>
                </CardHeader>
        <CardContent className="p-6">
                    {usersLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined On</TableHead>
                                    <TableHead>Properties</TableHead>
                                    <TableHead>Is Admin?</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(u => (
                                    <TableRow key={u.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {u.displayName?.charAt(0) || u.email.charAt(0)}
                          </span>
                        </div>
                                                <span>{u.displayName || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                          {(() => {
                                            try {
                                              console.log('Processing date for user:', u.email, 'createdAt:', u.createdAt);
                                              
                                              let date;
                                              
                                              // Check if it's a Firestore Timestamp
                                              if (u.createdAt && typeof u.createdAt === 'object' && u.createdAt.toDate) {
                                                console.log('Firestore Timestamp detected');
                                                date = u.createdAt.toDate();
                                              } 
                                              // Check if it's a Firestore Timestamp with seconds/nanoseconds
                                              else if (u.createdAt && typeof u.createdAt === 'object' && u.createdAt.seconds) {
                                                console.log('Firestore Timestamp with seconds detected');
                                                date = new Date(u.createdAt.seconds * 1000);
                                              }
                                              // Check if it's a string date
                                              else if (typeof u.createdAt === 'string') {
                                                console.log('String date detected:', u.createdAt);
                                                date = new Date(u.createdAt);
                                              }
                                              // Check if it's already a Date object
                                              else if (u.createdAt instanceof Date) {
                                                console.log('Date object detected');
                                                date = u.createdAt;
                                              }
                                              // Check if it's a number (timestamp)
                                              else if (typeof u.createdAt === 'number') {
                                                console.log('Number timestamp detected:', u.createdAt);
                                                date = new Date(u.createdAt);
                                              }
                                              else {
                                                console.log('No valid date found, returning N/A');
                                                return 'N/A';
                                              }
                                              
                                              console.log('Converted date:', date);
                                              
                                              if (isNaN(date.getTime())) {
                                                console.log('Invalid date detected');
                                                return 'Invalid Date';
                                              }
                                              
                                              const formatted = format(date, 'PPP');
                                              console.log('Formatted date:', formatted);
                                              return formatted;
                                            } catch (error) {
                                              console.error('Date formatting error:', error);
                                              return 'N/A';
                                            }
                                          })()}
                                        </TableCell>
                                        <TableCell>{u.properties?.length || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.isAdmin ? 'default' : 'secondary'}>
                                                {u.isAdmin ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
    </DashboardLayout>
  );
}
