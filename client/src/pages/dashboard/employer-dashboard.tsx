import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Job, Company, Application, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Briefcase,
  Building,
  Users,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
  Check,
  Mail,
  User as UserIcon,
  XCircle,
  CheckCircle,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch employer's company
  const { 
    data: company, 
    isLoading: isLoadingCompany
  } = useQuery<Company>({
    queryKey: ["/api/companies/owner"],
    queryFn: async () => {
      const res = await fetch("/api/companies/owner");
      if (!res.ok) throw new Error("Failed to fetch company");
      return res.json();
    },
  });

  // Fetch jobs posted by the employer
  const { 
    data: jobs, 
    isLoading: isLoadingJobs 
  } = useQuery<Job[]>({
    queryKey: ["/api/jobs", { companyId: company?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?companyId=${company?.id}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
    enabled: !!company?.id,
  });

  // Fetch applications for employer's jobs
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useQuery<(Application & { user?: User, job?: Job })[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  // Calculate application statistics
  const totalApplications = applications?.length || 0;
  const newApplications = applications?.filter(app => 
    app.status === 'pending' && 
    new Date(app.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;
  
  const inReviewApplications = applications?.filter(app => app.status === 'reviewed').length || 0;
  const interviewApplications = applications?.filter(app => app.status === 'interview').length || 0;

  // Calculate growth percentages (mocked for this example)
  const applicationsGrowth = 12; // 12% increase
  const viewsGrowth = -5; // 5% decrease
  
  // Get active vs. inactive jobs
  const activeJobs = jobs?.filter(job => job.status === 'active').length || 0;
  const inactiveJobs = jobs?.filter(job => job.status !== 'active').length || 0;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          {company ? `Managing ${company.name}` : 'Complete your company profile to start posting jobs'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Button onClick={() => navigate("/dashboard/post-job")}>
          <Briefcase className="mr-2 h-4 w-4" />
          Post a New Job
        </Button>
        {company ? (
          <Button variant="outline" onClick={() => navigate("/dashboard/company")}>
            <Building className="mr-2 h-4 w-4" />
            Manage Company Profile
          </Button>
        ) : (
          <Button onClick={() => navigate("/dashboard/company")}>
            <Building className="mr-2 h-4 w-4" />
            Create Company Profile
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Jobs</h3>
              <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            {isLoadingJobs ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {jobs?.length || 0}
              </p>
            )}
            <div className="flex items-center text-sm">
              <span className="text-gray-600 mr-2">{activeJobs} active</span>
              {inactiveJobs > 0 && (
                <span className="text-gray-400">• {inactiveJobs} inactive</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Applications</h3>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            {isLoadingApplications ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {totalApplications}
              </p>
            )}
            <div className="flex items-center text-sm">
              <span className={`flex items-center ${applicationsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {applicationsGrowth >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(applicationsGrowth)}%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">New Applications</h3>
              <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Mail className="h-5 w-5" />
              </div>
            </div>
            {isLoadingApplications ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {newApplications}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Need review from you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Job Views</h3>
              <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              248
            </p>
            <div className="flex items-center text-sm">
              <span className={`flex items-center ${viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {viewsGrowth >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(viewsGrowth)}%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2">
          {/* Active Job Listings */}
          <Card className="mb-8">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Active Job Listings</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/dashboard/post-job")}
                >
                  Post a Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingJobs ? (
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {jobs
                    .filter(job => job.status === 'active')
                    .slice(0, 5)
                    .map(job => {
                      const jobApplications = applications?.filter(app => app.jobId === job.id) || [];
                      const pendingApplications = jobApplications.filter(app => app.status === 'pending').length;
                      
                      return (
                        <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{job.title}</h3>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{job.location}</span>
                              {job.isRemote && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Remote</span>
                                </>
                              )}
                              <span className="mx-2">•</span>
                              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {jobApplications.length} applicants
                                {pendingApplications > 0 && ` (${pendingApplications} new)`}
                              </span>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                                  View Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/job/${job.id}/edit`)}>
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/job/${job.id}/applicants`)}>
                                  View Applicants
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Close Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 mb-4">You don't have any active job listings.</p>
                  <Button onClick={() => navigate("/dashboard/post-job")}>
                    Post Your First Job
                  </Button>
                </div>
              )}
              
              {jobs && jobs.filter(job => job.status === 'active').length > 5 && (
                <div className="px-6 py-4 border-t border-gray-200 text-center">
                  <Button variant="link" onClick={() => navigate("/dashboard/jobs")}>
                    View all job listings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Applications */}
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <Link href="/dashboard/applications">
                  <a className="text-primary text-sm font-medium hover:text-primary/90">View all</a>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingApplications ? (
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4">
                            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {applications.slice(0, 5).map(application => (
                    <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            {application.user ? (
                              application.user.avatar ? (
                                <img 
                                  src={application.user.avatar} 
                                  alt={`${application.user.firstName} ${application.user.lastName}`}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span>
                                  {application.user.firstName?.charAt(0)}
                                  {application.user.lastName?.charAt(0)}
                                </span>
                              )
                            ) : (
                              <UserIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-gray-900">
                              {application.user 
                                ? `${application.user.firstName} ${application.user.lastName}`
                                : "Anonymous Applicant"
                              }
                            </h3>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600">Applied for</span>
                              <span className="mx-1 font-medium text-gray-700">
                                {application.job?.title || "Unknown Position"}
                              </span>
                              <span className="mx-1 text-gray-400">•</span>
                              <span className="text-gray-500">
                                {new Date(application.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          application.status === 'pending' ? "bg-gray-100 text-gray-800 hover:bg-gray-200" :
                          application.status === 'reviewed' ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                          application.status === 'interview' ? "bg-green-100 text-green-800 hover:bg-green-200" :
                          application.status === 'rejected' ? "bg-red-100 text-red-800 hover:bg-red-200" :
                          "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        }>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="mt-3 flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No applications received yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Applications will appear here when candidates apply to your jobs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Company Profile Card */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingCompany ? (
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="h-6 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 mx-auto bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              ) : company ? (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="h-20 w-20 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <Building className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-gray-600 mb-4">{company.industry}</p>
                  
                  <div className="space-y-2 text-sm text-left mb-6">
                    {company.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.size && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{company.size}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-500 mr-2" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/dashboard/company")}
                    className="w-full"
                  >
                    Edit Company Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Company Profile</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Set up your company profile to start posting jobs and attracting talent.
                  </p>
                  <Button onClick={() => navigate("/dashboard/company")}>
                    Create Company Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Status Card */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingApplications ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : applications ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Review</span>
                    <span className="font-medium text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Review</span>
                    <span className="font-medium text-gray-900">
                      {inReviewApplications}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interview Stage</span>
                    <span className="font-medium text-gray-900">
                      {interviewApplications}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Applications</span>
                    <span className="font-medium text-gray-900">
                      {totalApplications}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/dashboard/applications")}
                    className="w-full mt-2"
                  >
                    Manage Applications
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">No application data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Employer Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Write clear job descriptions</span> that include responsibilities, qualifications, and benefits.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Respond to applications promptly</span> to keep candidates engaged in your hiring process.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Complete your company profile</span> with accurate information to attract the right talent.
                  </p>
                </div>
                
                <Button 
                  variant="link" 
                  className="text-primary p-0 h-auto w-full flex items-center justify-center mt-2"
                  onClick={() => navigate("/resources/employer")}
                >
                  View all hiring tips
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
