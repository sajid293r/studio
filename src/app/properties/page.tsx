"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Building, PlusCircle, Image as ImageIcon, MapPin, LoaderCircle, Phone, BadgeCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { propertySchema, type Property } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addProperty } from '../lib/user-actions';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AddPropertyDialog = ({ onPropertyAdded }: { onPropertyAdded: (newProperty: Property) => void }) => {
    const [open, setOpen] = React.useState(false);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
    const [logoFile, setLogoFile] = React.useState<File | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof propertySchema>>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            name: "",
            address: "",
            contactPhone: "",
        },
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    const onSubmit = async (values: z.infer<typeof propertySchema>) => {
        if (!user) return;
        try {
            const newProperty = await addProperty(user.uid, values, logoFile);
            toast({
                title: "Property Added!",
                description: `${values.name} has been successfully added. Activate it by choosing a subscription plan.`,
                className: 'bg-green-600 text-white'
            });
            onPropertyAdded(newProperty);
            setOpen(false);
            form.reset();
            setLogoFile(null);
            setLogoPreview(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to add property',
                description: error instanceof Error ? error.message : "An unknown error occurred."
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Property</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Add a New Property</DialogTitle>
                    <DialogDescription>Fill in the details below to register a new property.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., The Grand Resort" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, Anytown, USA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="contactPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                         <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="+91 12345 67890" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Logo</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted/40'>
                                                {logoPreview ? <Image src={logoPreview} alt="Logo preview" width={96} height={96} className='object-contain rounded-md' /> : <ImageIcon className='h-8 w-8 text-muted-foreground' />}
                                            </div>
                                            <Button type="button" variant="outline" asChild>
                                                <label htmlFor="logo-upload" className='cursor-pointer'>
                                                    Upload Logo
                                                    <input id="logo-upload" type="file" className='hidden' accept="image/*" onChange={handleLogoChange} />
                                                </label>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <><LoaderCircle className='animate-spin mr-2' /> Adding...</> : 'Add Property'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function PropertiesPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = React.useState(true);

  // Fetch properties from Firebase
  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      setPropertiesLoading(true);
      const response = await fetch(`/api/users/profile?uid=${user.uid}`);
      
      if (response.ok) {
        const userData = await response.json();
        if (userData?.properties) {
          setProperties(userData.properties);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProperties();
    }
  }, [user, loading, router]);

  const handlePropertyAdded = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    // Also refresh from Firebase to ensure consistency
    setTimeout(() => fetchProperties(), 1000);
  }

  const handleActivate = (property: Property) => {
    router.push(`/pricing?propertyId=${property.id}&propertyName=${encodeURIComponent(property.name)}`);
  };


  const getFormattedDate = (date: any): string => {
    if (!date) return '';
    
    try {
      let dateObj: Date;
      
      // Firestore Timestamps have a toDate() method
      if (date && typeof date === 'object' && date.toDate) {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return '';
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      return format(dateObj, 'PP');
    } catch (error) {
      return '';
    }
  };

  if (loading || !user || !userProfile || propertiesLoading) {
    return (
      <DashboardLayout
        currentPage="properties"
        title="Properties"
        description="Manage your properties and subscriptions"
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
      currentPage="properties"
      title="Properties"
      description="Manage your properties and subscriptions"
    >
      <Card className="shadow-elevated border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Manage Your Properties</CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground">Add, view, and manage subscriptions for the properties associated with your account.</CardDescription>
            </div>
            <AddPropertyDialog onPropertyAdded={handlePropertyAdded} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">No properties yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first property.</p>
              <div className="mt-6">
                <AddPropertyDialog onPropertyAdded={handlePropertyAdded} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Card key={property.id} className="flex flex-col shadow-soft hover:shadow-elevated transition-all duration-200">
                  <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
                    <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-muted/40 shrink-0">
                      {property.logoUrl ? (
                        <Image src={property.logoUrl} alt={`${property.name} logo`} width={64} height={64} className="object-contain rounded-md" />
                      ) : (
                        <Building className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className='flex-1'>
                      <CardTitle className="text-lg font-headline">{property.name}</CardTitle>
                      <CardDescription className='flex items-start gap-1 mt-1'>
                        <MapPin className='h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0' />
                        <span className='line-clamp-2 text-xs'>{property.address}</span>
                      </CardDescription>
                      <CardDescription className='flex items-center gap-1 mt-1'>
                        <Phone className='h-3 w-3 text-muted-foreground shrink-0' />
                        <span className='text-xs'>{property.contactPhone}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    {property.subscription_status === 'active' ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700 w-full justify-center">
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Active until {getFormattedDate(property.subscription_end_date)}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="w-full justify-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Inactive
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-4">
                    {property.subscription_status === 'active' ? (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleActivate(property)}>
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => handleActivate(property)}>
                        <Crown className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}