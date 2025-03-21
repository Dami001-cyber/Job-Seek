import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/ui/job-card";
import { useQuery } from "@tanstack/react-query";
import { Job, Company, Application, SavedJob, Profile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Send,
  Bookmark,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";


export default function SeekerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user's applications
  const {
    data: applications,
    isLoading: isLoadingApplications,
  } = useQuery<(Application & { job?: Job, company?: Company })[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  // Fetch saved jobs
  const {
    data: savedJobs,
    isLoading: isLoadingSavedJobs,
  } = useQuery<(SavedJob & { job?: Job, company?: Company })[]>({
    queryKey: ["/api/saved-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/saved-jobs");
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      return res.json();
    },
  });

  // Fetch user profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
  } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  // Fetch recommended jobs
  const {
    data: recommendedJobs,
    isLoading: isLoadingRecommendedJobs,
  } = useQuery<(Job & { company?: Company })[]>({
    queryKey: ["/api/jobs", "recommended"],
    queryFn: async () => {
      const res = await fetch("/api/jobs?recommended=true&limit=5");
      if (!res.ok) throw new Error("Failed to fetch recommended jobs");
      return res.json();
    },
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    let total = 5; // total number of sections

    // Check if profile has basic info
    if (user?.firstName && user?.lastName && user?.email) completed++;
    // Check if profile has skills
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) completed++;
    // Check if profile has education
    if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) completed++;
    // Check if profile has experience
    if (profile.experience && Array.isArray(profile.experience) && profile.experience.length > 0) completed++;
    // Check if profile has resume
    if (profile.resumeUrl) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletionPercentage = calculateProfileCompletion();

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's your job search progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Applications</h3>
              <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                <Send size={20} />
              </div>
            </div>
            {isLoadingApplications ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {applications?.length || 0}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {applications?.filter(app => app.status === 'pending').length || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Saved Jobs</h3>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <Bookmark size={20} />
              </div>
            </div>
            {isLoadingSavedJobs ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {savedJobs?.length || 0}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {recommendedJobs ? `${Math.min(recommendedJobs.length, 8)} new matches` : '0 new matches'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Interviews</h3>
              <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Users weight="fill" size={20} />
              </div>
            </div>
            {isLoadingApplications ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {applications?.filter(app => app.status === 'interview').length || 0}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {applications?.filter(app => app.status === 'interview' && new Date(app.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0} upcoming this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Profile Views</h3>
              <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
                <Eye weight="fill" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              36
            </p>
            <p className="text-sm text-gray-600">
              +12% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2">
          {/* Recent Applications */}
          <Card className="bg-white mb-8">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded"></div>
                          <div className="ml-4">
                            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="h-6 w-20 bg-gray-200 rounded mb-1"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                            {application.job?.company?.logo ? (
                              <img 
                                src={application.job.company.logo} 
                                alt={application.job.company.name} 
                                className="h-full w-full object-contain" 
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                {application.job?.company?.name?.charAt(0) || "C"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-gray-900">{application.job?.title || "Unknown Position"}</h3>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600">{application.job?.company?.name || "Unknown Company"}</span>
                              <span className="mx-2 text-gray-200">•</span>
                              <span className="text-gray-600">{application.job?.location || "Unknown Location"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className={
                            application.status === 'pending' ? "bg-gray-100 text-gray-800 hover:bg-gray-200" :
                            application.status === 'reviewed' ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                            application.status === 'interview' ? "bg-green-100 text-green-800 hover:bg-green-200" :
                            application.status === 'rejected' ? "bg-red-100 text-red-800 hover:bg-red-200" :
                            "bg-purple-100 text-purple-800 hover:bg-purple-200"
                          }>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500 mt-1">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/jobs")}
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Recommended for You</CardTitle>
                <Link href="/jobs">
                  <a className="text-primary text-sm font-medium hover:text-primary/90">View more</a>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingRecommendedJobs ? (
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-6 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded"></div>
                          <div className="ml-4">
                            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full mr-4"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendedJobs && recommendedJobs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recommendedJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                            {job.company?.logo ? (
                              <img 
                                src={job.company.logo} 
                                alt={job.company.name} 
                                className="h-full w-full object-contain" 
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                {job.company?.name?.charAt(0) || "C"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-gray-900">{job.title}</h3>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600">{job.company?.name}</span>
                              <span className="mx-2 text-gray-200">•</span>
                              <span className="text-gray-600">{job.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 mr-4"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            <Bookmark size={20} className="text-gray-400" />
                          </Button>
                          <span className="font-medium text-gray-900 text-sm">
                            {job.salaryMin && job.salaryMax 
                              ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                              : job.salaryMin 
                                ? `$${job.salaryMin.toLocaleString()}+` 
                                : job.salaryMax 
                                  ? `Up to $${job.salaryMax.toLocaleString()}` 
                                  : 'Not disclosed'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-primary hover:bg-blue-100 border-blue-200">
                          {job.type}
                        </Badge>
                        {job.isRemote && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                            Remote
                          </Badge>
                        )}
                        {job.experienceLevel && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200">
                            {job.experienceLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary font-medium text-sm"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No recommended jobs at the moment.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/jobs")}
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Completion */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{profileCompletionPercentage}% Complete</span>
                <span className="text-primary text-sm font-medium">
                  {Math.round(profileCompletionPercentage / 20)}/5 Sections
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-primary rounded-full h-2" 
                  style={{ width: `${profileCompletionPercentage}%` }}
                ></div>
              </div>
              
              {isLoadingProfile ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-gray-200 mr-2"></div>
                      <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    {user?.firstName && user?.lastName && user?.email ? (
                      <CheckCircle size={20} weight="fill" className="text-green-500 mr-2" />
                    ) : (
                      <Clock size={20} className="text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-600">Personal Information</span>
                  </li>
                  <li className="flex items-center text-sm">
                    {profile?.education && Array.isArray(profile.education) && profile.education.length > 0 ? (
                      <CheckCircle size={20} weight="fill" className="text-green-500 mr-2" />
                    ) : (
                      <Clock size={20} className="text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-600">Education</span>
                  </li>
                  <li className="flex items-center text-sm">
                    {profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0 ? (
                      <CheckCircle size={20} weight="fill" className="text-green-500 mr-2" />
                    ) : (
                      <Clock size={20} className="text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-600">Experience</span>
                  </li>
                  <li className="flex items-center text-sm">
                    {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                      <CheckCircle size={20} weight="fill" className="text-green-500 mr-2" />
                    ) : (
                      <Clock size={20} className="text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-600">Skills</span>
                  </li>
                  <li className="flex items-center text-sm">
                    {profile?.resumeUrl ? (
                      <CheckCircle size={20} weight="fill" className="text-green-500 mr-2" />
                    ) : (
                      <Clock size={20} className="text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-600">Resume</span>
                  </li>
                </ul>
              )}
              <Button 
                onClick={() => navigate("/dashboard/profile")}
                variant="outline" 
                className="mt-4 w-full"
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingApplications ? (
                <div className="animate-pulse space-y-4">
                  <div>
                    <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : applications?.some(app => app.status === 'interview') ? (
                <div className="mb-6">
                  {applications
                    .filter(app => app.status === 'interview')
                    .slice(0, 1)
                    .map(interview => (
                      <div key={interview.id}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{interview.job?.title} Interview</h3>
                          <span className="text-xs text-primary font-medium">In 2 days</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{interview.job?.company?.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(interview.updatedAt).toLocaleDateString()} • 10:00 AM</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No upcoming interviews</p>
                  <p className="text-sm text-gray-500">
                    Keep applying to jobs to schedule interviews
                  </p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard/applications")}
              >
                View All Interviews
              </Button>
            </CardContent>
          </Card>

          {/* Job Search Tips */}
          <Card className="bg-white">
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg">Job Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <a href="#" className="block mb-4 hover:bg-gray-50 p-2 rounded-md -mx-2">
                <h3 className="font-medium text-gray-900 text-sm mb-1">How to Prepare for a Technical Interview</h3>
                <p className="text-gray-600 text-xs">5 min read</p>
              </a>
              <a href="#" className="block mb-4 hover:bg-gray-50 p-2 rounded-md -mx-2">
                <h3 className="font-medium text-gray-900 text-sm mb-1">Tips for Negotiating Your Salary</h3>
                <p className="text-gray-600 text-xs">3 min read</p>
              </a>
              <a href="#" className="block hover:bg-gray-50 p-2 rounded-md -mx-2">
                <h3 className="font-medium text-gray-900 text-sm mb-1">Creating a Portfolio That Stands Out</h3>
                <p className="text-gray-600 text-xs">4 min read</p>
              </a>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/resources")}
              >
                View All Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
