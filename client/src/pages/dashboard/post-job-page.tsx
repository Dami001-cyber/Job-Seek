import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Briefcase,
  Building,
  Home,
  Loader2,
  MapPin,
  PlusCircle,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Trash
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Extended schema with additional validation
const jobFormSchema = insertJobSchema.extend({
  salaryMin: z.coerce.number().min(0, "Minimum salary must be at least 0").optional(),
  salaryMax: z.coerce.number().min(0, "Maximum salary must be at least 0").optional(),
}).refine(data => {
  // If both salaries are provided, make sure min is less than max
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin < data.salaryMax;
  }
  return true;
}, {
  message: "Minimum salary must be less than maximum salary",
  path: ["salaryMin"],
});

export default function PostJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  
  // Fetch employer's company
  const { 
    data: company,
    isLoading: isLoadingCompany,
    error: companyError
  } = useQuery({
    queryKey: ["/api/companies/owner"],
    queryFn: async () => {
      const res = await fetch("/api/companies/owner");
      if (!res.ok) throw new Error("Failed to fetch company");
      return res.json();
    },
  });

  // Job form
  const form = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      type: "Full-time",
      isRemote: false,
      experienceLevel: "Entry",
      status: "active",
      salaryMin: undefined,
      salaryMax: undefined,
    },
  });

  // Set company ID when company data is loaded
  useEffect(() => {
    if (company) {
      form.setValue("companyId", company.id);
    }
  }, [company, form]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobFormSchema>) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job posting has been published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setFormDirty(false);
      navigate("/dashboard/employer");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof jobFormSchema>) => {
    // Ensure companyId is set
    if (!data.companyId && company) {
      data.companyId = company.id;
    }
    
    createJobMutation.mutate(data);
  };

  // Handle form changes
  const handleFormChange = () => {
    if (!formDirty) setFormDirty(true);
  };

  // Handle discard
  const handleDiscard = () => {
    if (formDirty) {
      setIsDiscardAlertOpen(true);
    } else {
      navigate(user?.role === 'employer' ? "/dashboard/employer" : "/dashboard/admin");
    }
  };

  // Confirm discard
  const confirmDiscard = () => {
    navigate(user?.role === 'employer' ? "/dashboard/employer" : "/dashboard/admin");
    setIsDiscardAlertOpen(false);
  };

  // Check if user has no company
  const hasNoCompany = !isLoadingCompany && (companyError || !company);

  // Watch form values for salary validation
  const watchSalaryMin = form.watch("salaryMin");
  const watchSalaryMax = form.watch("salaryMax");

  // Calculate if salaryMax is less than salaryMin
  const salaryError = watchSalaryMin && watchSalaryMax && watchSalaryMin >= watchSalaryMax;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={user?.role === 'employer' ? "/dashboard/employer" : "/dashboard/admin"}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Post a Job</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a New Job</h1>
        <p className="text-gray-600">Create a detailed job posting to attract the right candidates</p>
      </div>

      {hasNoCompany ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Company Required</CardTitle>
            <CardDescription>
              You need to create a company before you can post a job.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Profile Found</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Before posting a job, you need to create a company profile. This information will be displayed to job seekers.
            </p>
            <Button onClick={() => navigate("/dashboard/company")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Company Profile
            </Button>
          </CardContent>
        </Card>
      ) : isLoadingCompany ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading company information...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Job Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your job posting. Be as specific as possible to attract qualified candidates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                onChange={handleFormChange}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Developer, Marketing Manager" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use a specific job title to attract the right candidates.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="e.g. New York, NY" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where the job is located or specify if multiple locations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Temporary">Temporary</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The employment type for this position.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Entry">Entry Level</SelectItem>
                            <SelectItem value="Mid">Mid Level</SelectItem>
                            <SelectItem value="Senior">Senior Level</SelectItem>
                            <SelectItem value="Executive">Executive Level</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The required experience level for this position.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Remote Position</FormLabel>
                          <FormDescription>
                            Can this job be performed remotely?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="salaryMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Salary</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              type="number" 
                              placeholder="e.g. 50000" 
                              className="pl-9"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum annual salary for this position (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salaryMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Salary</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              type="number" 
                              placeholder="e.g. 80000" 
                              className={`pl-9 ${salaryError ? 'border-red-500' : ''}`}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Maximum annual salary for this position (optional).
                        </FormDescription>
                        {salaryError && (
                          <p className="text-sm font-medium text-red-500">Maximum salary must be greater than minimum salary</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the position, responsibilities, requirements, benefits, etc."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the job. Include responsibilities, requirements, and company benefits.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posting Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select posting status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active (Visible to job seekers)</SelectItem>
                          <SelectItem value="draft">Draft (Hidden from job seekers)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set if this job should be immediately visible to job seekers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDiscard}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post Job
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Discard Job Alert Dialog */}
      <AlertDialog open={isDiscardAlertOpen} onOpenChange={setIsDiscardAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard this job posting? All your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

// Missing import, adding it here
import { useEffect } from "react";
