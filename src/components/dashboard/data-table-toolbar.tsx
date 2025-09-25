"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Users,
  FileText,
  Phone,
  Hash,
  Copy,
  XCircle,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Property, Submission } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { type Table } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";


const addSubmissionSchema = z
  .object({
    propertyId: z.string({ required_error: "Please select a property."}),
    bookingId: z.string().min(1, { message: "Booking ID is required." }),
    mainGuestName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    mainGuestPhoneNumber: z.string().min(10, { message: "A valid phone number is required." }),
    numberOfGuests: z.coerce.number().min(1, { message: "Must have at least 1 guest." }).max(10, { message: "Cannot exceed 10 guests." }),
    checkInDate: z.date({ required_error: "A check-in date is required." }),
    checkOutDate: z.date({ required_error: "A check-out date is required." }),
    termsAndConditions: z.string().min(20, { message: "Terms & Conditions must be at least 20 characters." }),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date.",
    path: ["checkOutDate"],
  });

interface DataTableToolbarProps<TData> {
  table?: Table<TData>;
  onAddSubmission: (newSubmission: Omit<Submission, 'id'>) => void;
  onDeleteSelected: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onAddSubmission,
  onDeleteSelected,
}: DataTableToolbarProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const { user, userProfile } = useAuth();
  const [lastCreatedSubmission, setLastCreatedSubmission] = React.useState<Submission | null>(null);
  const { toast } = useToast();
  
  const properties: Property[] = userProfile?.properties || [];
  const activeProperties = properties.filter(p => p.subscription_status === 'active');
  
  const form = useForm<z.infer<typeof addSubmissionSchema>>({
    resolver: zodResolver(addSubmissionSchema),
    defaultValues: {
      numberOfGuests: 1,
      termsAndConditions:
        "1. The guest assumes all responsibility for any damages to the room or hotel property. \n2. The hotel is not responsible for lost or stolen articles. \n3. Smoking is strictly prohibited in all rooms and public areas. A cleaning fee will be assessed for violations. \n4. Check-out time is 11:00 AM. Late check-outs may incur additional charges.",
    },
  });

  const onSubmit = async (values: z.infer<typeof addSubmissionSchema>) => {
    try {
      const selectedProperty = activeProperties.find(p => p.id === values.propertyId);
      if (!selectedProperty) {
          throw new Error("Selected property not found.");
      }

      const newSubmission = {
        ...values,
        userId: user?.uid || '',
        propertyName: selectedProperty.name,
        status: "Awaiting Guest",
        guests: Array.from({ length: values.numberOfGuests }, (_, i) => ({
          id: `G${i + 1}`,
          guestNumber: i + 1,
          status: "Pending",
        })),
      } as Omit<Submission, 'id'>;

      onAddSubmission(newSubmission);
      setLastCreatedSubmission(newSubmission as Submission);
      form.reset({
        numberOfGuests: 1,
        termsAndConditions: form.getValues('termsAndConditions') // Keep the same terms
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error creating the submission. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    if (lastCreatedSubmission) {
      // Note: We can't get the actual ID here since it's created on the server
      // The submission will be refetched and the URL will be available in the table
      toast({
        title: "Submission Created!",
        description: `Submission for ${lastCreatedSubmission.mainGuestName} has been created successfully.`,
        duration: 5000,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCreatedSubmission, toast]);


  const isFiltered = (table?.getState().columnFilters.length || 0) > 0;
  const selectedRowCount = table?.getFilteredSelectedRowModel().rows.length || 0;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex flex-1 items-center space-x-3">
        <Input
          placeholder="Filter by name..."
          value={(table?.getColumn("mainGuestName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table?.getColumn("mainGuestName")?.setFilterValue(event.target.value)}
          className="h-11 w-[200px] lg:w-[300px] rounded-xl border-2 focus:border-primary/50 transition-all duration-200"
        />
        {table?.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")!}
            title="Status"
            options={[
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
              { label: "Pending", value: "Pending" },
              { label: "Awaiting Guest", value: "Awaiting Guest" },
            ]}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table?.resetColumnFilters()} className="h-11 px-4 rounded-xl hover:bg-muted/50 transition-all duration-200">
            Reset
            <XCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {selectedRowCount > 0 && (
          <Button variant="ghost" className="h-11 px-4 rounded-xl text-destructive hover:text-destructive hover:bg-red-50 transition-all duration-200 font-semibold" onClick={onDeleteSelected}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedRowCount})
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button size="lg" className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" disabled={activeProperties.length === 0}>
              <PlusCircle className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Submission</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">Create New Submission</DialogTitle>
              <DialogDescription>Fill out the details below to create a new check-in link for guests.</DialogDescription>
            </DialogHeader>

            {activeProperties.length === 0 ? (
                 <Alert>
                    <Building className="h-4 w-4" />
                    <AlertTitle>No Active Properties</AlertTitle>
                    <AlertDescription>
                        You must have at least one active property subscription to create a submission. 
                        <Button variant="link" asChild><Link href="/properties">Activate a Property</Link></Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                      control={form.control}
                      name="propertyId"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select an active property" />
                                      </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {activeProperties.map(prop => (
                                          <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="bookingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., BK-10593" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mainGuestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Guest Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mainGuestPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="+1-555-123-4567" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="numberOfGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" placeholder="1" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-in Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-out Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < (form.getValues("checkInDate") || new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Terms & Conditions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the terms and conditions for this booking..."
                            className="resize-y min-h-[80px] md:min-h-[100px] font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>These terms will be shown to the guest for acceptance.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                      {form.formState.isSubmitting ? "Creating..." : "Create Submission"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
