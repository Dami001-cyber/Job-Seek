import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useParams } from "wouter";
import { Job, Company, Application, SavedJob } from "@shared/schema";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Bookmark, 
  DollarSign, 
  Building, 
  Globe, 
  Users, 
  Clock, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function JobDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const jobId = parseInt(id);

  // Fetch job details
  const { 
    data: job,
    isLoading: isLoadingJob,
    error: jobError
  } = useQuery<Job & { company?: Company }>({
    queryKey: [`/api/jobs/${jobId}`],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job details");
      return res.json();
    },
  });

  // Check if user has already applied to this job
  const {
    data: applications,
    isLoading: isLoadingApplications,
  } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user && user.role === "job_seeker",
  });

  // Check if job is saved
  const {
    data: savedJobs,
    isLoading: isLoadingSavedJobs,
  } = useQuery<SavedJob[]>({
    queryKey: ["/api/saved-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/saved-jobs");
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      return res.json();
    },
    enabled: !!user && user.role === "job_seeker",
  });

  const hasApplied = applications?.some(app => app.jobId === jobId);
  const savedJob = savedJobs?.find(sj => sj.jobId === jobId);
  
  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      const data = { 
        jobId, 
        resumeUrl,
        coverLetter
      };
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved-jobs", { jobId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job saved",
        description: "The job has been added to your saved jobs.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove saved job mutation
  const removeSavedJobMutation = useMutation({
    mutationFn: async () => {
      if (!savedJob) throw new Error("Job not saved");
      await apiRequest("DELETE", `/api/saved-jobs/${savedJob.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Job removed",
        description: "The job has been removed from your saved jobs.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not remove job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveJob = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (savedJob) {
      removeSavedJobMutation.mutate();
    } else {
      saveJobMutation.mutate();
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (hasApplied) {
      toast({
        title: "Already applied",
        description: "You have already applied to this job.",
      });
      return;
    }

    applyMutation.mutate();
  };

  // Format salary range
  const formatSalary = () => {
    if (!job) return '';
    if (!job.salaryMin && !job.salaryMax) return 'Not disclosed';
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
    return `Up to $${job.salaryMax?.toLocaleString()}`;
  };

  if (isLoadingJob) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (jobError || !job) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h1>
              <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/jobs")}>Browse All Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Job Header Card */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-16 w-16 rounded-lg object-contain bg-white border p-2"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Building className="h-8 w-8" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-lg text-gray-600">{job.company?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4 md:mt-0">
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={handleSaveJob}
                        disabled={saveJobMutation.isPending || removeSavedJobMutation.isPending}
                      >
                        <Bookmark className={`mr-2 h-5 w-5 ${savedJob ? 'fill-primary text-primary' : ''}`} />
                        {savedJob ? 'Saved' : 'Save Job'}
                      </Button>
                      <Button 
                        onClick={hasApplied ? undefined : handleApply}
                        disabled={hasApplied || applyMutation.isPending}
                      >
                        {applyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : hasApplied ? (
                          "Applied"
                        ) : (
                          "Apply Now"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{job.location}</span>
                      {job.isRemote && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                          Remote
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{formatSalary()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Job Details Tabs */}
              <Tabs defaultValue="description" className="mb-8">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="apply">How to Apply</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: job.description }} />
                      
                      {job.experienceLevel && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
                          <p>{job.experienceLevel}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="company" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>About the Company</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-6">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="h-16 w-16 rounded-lg object-contain bg-white border p-2"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <Building className="h-8 w-8" />
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">{job.company?.name}</h3>
                          {job.company?.industry && (
                            <p className="text-gray-600">{job.company.industry}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {job.company?.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{job.company.location}</span>
                          </div>
                        )}
                        {job.company?.website && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="h-5 w-5 mr-2 text-gray-400" />
                            <a
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Company Website
                            </a>
                          </div>
                        )}
                        {job.company?.size && (
                          <div className="flex items-center text-gray-600">
                            <Users className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{job.company.size}</span>
                          </div>
                        )}
                      </div>
                      
                      {job.company?.description && (
                        <div className="prose max-w-none">
                          <h3 className="text-lg font-semibold mb-2">Description</h3>
                          <p>{job.company.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="apply" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>How to Apply</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user ? (
                        hasApplied ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-green-800 mb-2">You've Already Applied</h3>
                            <p className="text-green-700">Your application has been submitted. You can check its status on your dashboard.</p>
                            <Button 
                              className="mt-4" 
                              variant="outline"
                              onClick={() => navigate("/dashboard/applications")}
                            >
                              View My Applications
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-6">Submit your application for the {job.title} position at {job.company?.name}.</p>
                            
                            <div className="space-y-6">
                              <div>
                                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                                  Resume URL
                                </label>
                                <Input
                                  id="resume"
                                  type="text"
                                  placeholder="https://example.com/my-resume.pdf"
                                  value={resumeUrl}
                                  onChange={(e) => setResumeUrl(e.target.value)}
                                  className="w-full"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  Add a link to your resume (Google Drive, Dropbox, etc.)
                                </p>
                              </div>
                              
                              <div>
                                <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700 mb-1">
                                  Cover Letter
                                </label>
                                <Textarea
                                  id="cover-letter"
                                  placeholder="Tell us why you're a great fit for this role..."
                                  value={coverLetter}
                                  onChange={(e) => setCoverLetter(e.target.value)}
                                  className="w-full min-h-[200px]"
                                />
                              </div>
                              
                              <Button 
                                className="w-full" 
                                onClick={handleApply}
                                disabled={applyMutation.isPending}
                              >
                                {applyMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Application...
                                  </>
                                ) : (
                                  "Submit Application"
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to apply</h3>
                          <p className="text-gray-600 mb-6">Create an account or sign in to apply for this job.</p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => navigate("/auth?tab=login")}>
                              Sign In
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/auth?tab=register")}>
                              Create Account
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Similar Jobs Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* We'll add actual similar jobs in a real implementation */}
                  <div className="p-4 text-center text-gray-500">
                    <p>Similar jobs feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Job Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Job Type</h4>
                      <p className="text-gray-600">{job.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Salary Range</h4>
                      <p className="text-gray-600">{formatSalary()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-600">
                        {job.location}
                        {job.isRemote && " (Remote available)"}
                      </p>
                    </div>
                  </div>
                  
                  {job.experienceLevel && (
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Experience Level</h4>
                        <p className="text-gray-600">{job.experienceLevel}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Posted On</h4>
                      <p className="text-gray-600">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* CTA Card */}
              <Card className="bg-primary text-white">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2">Ready to Apply?</h3>
                  <p className="mb-4 text-blue-100">Take the next step in your career journey.</p>
                  <Button 
                    className="w-full bg-white text-primary hover:bg-gray-100" 
                    onClick={hasApplied ? () => navigate("/dashboard/applications") : handleApply}
                    disabled={applyMutation.isPending}
                  >
                    {hasApplied ? "View My Application" : "Apply Now"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Mock Input component for the code to compile
function Input(props: any) {
  return <input {...props} className={`border rounded-md px-3 py-2 ${props.className}`} />;
}
