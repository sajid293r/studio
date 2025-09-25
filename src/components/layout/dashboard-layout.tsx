"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, Home as HomeIcon, Building, Settings, UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'properties' | 'admin';
  title: string;
  description: string;
}

export function DashboardLayout({ children, currentPage, title, description }: DashboardLayoutProps) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full flex-col bg-muted/40 animate-fade-in">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-6 border-b bg-background/95 backdrop-blur-md px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Stay Verify
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/40 animate-fade-in">
        {/* Fixed Left Sidebar */}
        <Sidebar className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <SidebarHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3 p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight font-headline group-data-[collapsible=icon]:hidden bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Stay Verify
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6">
            <SidebarMenu className="space-y-3">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPage === 'dashboard'} className="h-12 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:shadow-md data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-primary">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-semibold">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPage === 'properties'} className="h-12 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:shadow-md data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-primary">
                  <Link href="/properties" className="flex items-center gap-3">
                    <Building className="h-5 w-5" />
                    <span className="font-semibold">Properties</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-3 bg-muted/20">
            <SidebarMenu className="space-y-2">
              {userProfile?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPage === 'admin'} className="h-11 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:shadow-md data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-primary">
                    <Link href="/admin" className="flex items-center gap-3">
                      <UserCog className="h-4 w-4" />
                      <span className="font-medium">Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 rounded-lg transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Scrollable Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fixed Header */}
          <header className="sticky top-0 z-30 flex h-20 items-center gap-6 border-b bg-background/95 backdrop-blur-md px-6 shadow-sm flex-shrink-0">
            <SidebarTrigger className="md:hidden h-11 w-11 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:shadow-sm" />
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-base text-muted-foreground font-medium">
                  {description}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 animate-scale-in shadow-xl border-0 bg-card/95 backdrop-blur-md">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-base font-semibold leading-none">{user.displayName || 'User'}</p>
                      <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log('Logout button clicked');
                      logout();
                    }} 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-4 text-base font-medium cursor-pointer"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
