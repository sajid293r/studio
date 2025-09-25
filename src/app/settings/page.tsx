"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Key, 
  Trash2, 
  Download,
  Upload,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    dataSharing: false,
    analytics: true,
  });

  // Update form data when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || user?.displayName || '',
        phone: userProfile.phone || '',
      });
      setNotifications({
        email: userProfile.notifications?.email ?? true,
        push: userProfile.notifications?.push ?? false,
        sms: userProfile.notifications?.sms ?? false,
      });
      setPrivacy({
        profileVisible: userProfile.privacy?.profileVisible ?? true,
        dataSharing: userProfile.privacy?.dataSharing ?? false,
        analytics: userProfile.privacy?.analytics ?? true,
      });
    }
  }, [userProfile, user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          displayName: formData.displayName,
          phone: formData.phone,
          notifications,
          privacy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        className: 'bg-green-600 text-white'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be sent to your email shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      variant: 'destructive',
      title: 'Account Deletion',
      description: 'Account deletion is not available in demo mode.',
    });
  };

  if (loading || !user || !userProfile) {
    return (
      <DashboardLayout
        currentPage="dashboard"
        title="Settings"
        description="Manage your account settings and preferences"
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
      currentPage="dashboard"
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    defaultValue={userProfile.email || user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and data preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="profile-visible">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow data sharing for service improvement
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={privacy.dataSharing}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataSharing: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing usage analytics
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={privacy.analytics}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export your data or manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your data
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Account deletion is permanent and cannot be undone. All your data will be permanently removed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
