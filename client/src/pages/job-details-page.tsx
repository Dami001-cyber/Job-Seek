import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobApplicationForm from "@/components/forms/JobApplicationForm";
import { Job, Company, JobApplication, UserRole } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Building, Calendar, Briefcase, Clock, DollarSign, Globe, BookmarkPlus } from "lucide-react";

export default function JobDetailsPage() {
  const [, params] = useRoute("/jobs/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const jobId = params ? parseInt(params.id) : 0;

  // Get job details
  const {
    data: job,
    isLoading: isJobLoading,
    isError: isJobError,
    error: jobError,
  } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
  });

  // Get company details if job is loaded
  const {
    data: company,
    isLoading: isCompanyLoading,
  } = useQuery<Company>({
    queryKey: [job && `/api/companies/${job.companyId}`],
    enabled: !!job,
    queryFn: async () => {
      // Simplified for the MVP - normally would fetch from API
      // This is a placeholder to match with the JobCard component
      return {
        id: job!.companyId,
        name: `Company ${job!.companyId}`,
        logo: "",
        website: "",
        description: "Company description would go here in a full implementation.",
        industry: "Various",
        location: job!.location,
        userId: 1,
      };
    },
  });

  // Check if user has already applied
  const { data: userApplications, isLoading: isApplicationsLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/job-applications"],
    enabled: !!user && user.role === UserRole.JOB_SEEKER,
  });

  const hasApplied = userApplications?.some(app => app.jobId === jobId);

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/saved-jobs", { jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      toast({
        title: "Job saved",
        description: "This job has been added to your saved jobs.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveJob = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to save jobs.",
        variant: "destructive",
      });
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    saveJobMutation.mutate();
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    if (user.role !== UserRole.JOB_SEEKER) {
      toast({
        title: "Access restricted",
        description: "Only job seekers can apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    setShowApplicationForm(true);
  };

  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isJobLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Job</h2>
            <p className="text-gray-600 mb-6">
              {jobError instanceof Error ? jobError.message : "Failed to load job details. The job may not exist or has been removed."}
            </p>
            <Button asChild>
              <a href="/jobs">Browse All Jobs</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Header */}
              <Card className="border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="flex items-start mb-4 md:mb-0">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                        {company?.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <span className="text-indigo-500 font-bold text-xl">
                            {company?.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() || job.companyId.toString().substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-gray-600">
                          {company?.name || `Company ${job.companyId}`}
                        </p>
                        <div className="flex items-center mt-1 text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location} {job.isRemote && "(Remote)"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {user?.role === UserRole.JOB_SEEKER && (
                        <Button 
                          variant="outline" 
                          className="flex items-center"
                          onClick={handleSaveJob}
                          disabled={saveJobMutation.isPending}
                        >
                          {saveJobMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <BookmarkPlus className="h-4 w-4 mr-2" />
                          )}
                          Save Job
                        </Button>
                      )}
                      
                      <Button 
                        onClick={handleApplyClick}
                        disabled={hasApplied}
                      >
                        {hasApplied ? "Already Applied" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 pt-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        Job Type
                      </span>
                      <span className="font-medium">{job.type}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Salary
                      </span>
                      <span className="font-medium">{job.salary || "Not disclosed"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Posted On
                      </span>
                      <span className="font-medium">{formatDate(job.createdAt)}</span>
                    </div>
                    {job.isRemote && (
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          Remote
                        </span>
                        <span className="font-medium">Yes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Job Description */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{job.description}</p>
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold mt-6 mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Application Form (shown when user clicks Apply) */}
              {showApplicationForm && (
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Apply for this position</CardTitle>
                    <CardDescription>
                      Complete the form below to submit your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JobApplicationForm 
                      job={job}
                      onSuccess={() => {
                        setShowApplicationForm(false);
                        queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>About the company</CardTitle>
                </CardHeader>
                <CardContent>
                  {isCompanyLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : company ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-14 w-14 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.name} 
                              className="h-10 w-10 object-contain"
                            />
                          ) : (
                            <span className="text-indigo-500 font-bold text-xl">
                              {company.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{company.name}</h3>
                          <p className="text-gray-500 text-sm">{company.industry}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                          <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <span>{company.location}</span>
                        </div>
                        
                        {company.website && (
                          <div className="flex items-start">
                            <Globe className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <a 
                              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {company.description && (
                        <>
                          <Separator className="my-4" />
                          <p className="text-gray-600 text-sm">{company.description}</p>
                        </>
                      )}
                      
                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          View All Jobs by This Company
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Company information not available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Similar Jobs Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">
                      Similar jobs will appear here based on this job's skills and requirements
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Application Success Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">Open Dialog</span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Submitted!</DialogTitle>
            <DialogDescription>
              Your application for {job.title} has been submitted successfully. You can track the status of your application from your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 mt-4">
            <Button asChild variant="outline">
              <a href="/jobs">Browse More Jobs</a>
            </Button>
            <Button asChild>
              <a href="/dashboard/job-seeker">Go to Dashboard</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
