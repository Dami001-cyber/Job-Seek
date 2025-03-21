import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/common/DashboardLayout";
import ProfileForm from "@/components/forms/ProfileForm";
import ApplicationsTable from "@/components/job/ApplicationsTable";
import SavedJobsTable from "@/components/job/SavedJobsTable";
import StatsCard from "@/components/common/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Briefcase, BookmarkCheck, ClipboardList, UserRound } from "lucide-react";

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Parse query parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const tabParam = params.get("tab");
  
  // Set active tab from URL if provided
  useState(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  });

  // Redirect if user is not a job seeker
  if (user && user.role !== UserRole.JOB_SEEKER) {
    if (user.role === UserRole.EMPLOYER) {
      navigate("/dashboard/employer");
    } else if (user.role === UserRole.ADMIN) {
      navigate("/dashboard/admin");
    } else {
      navigate("/");
    }
  }

  // Fetch job applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["/api/job-applications"],
    enabled: !!user
  });

  // Fetch saved jobs
  const { data: savedJobs, isLoading: isLoadingSavedJobs } = useQuery({
    queryKey: ["/api/saved-jobs"],
    enabled: !!user
  });

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/job-seeker-profile"],
    enabled: !!user
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/job-seeker?tab=${value}`, { replace: true });
  };

  const profileCompleteness = () => {
    if (!profile) return 0;
    
    let fields = 0;
    let completed = 0;
    
    if (profile.title !== undefined) { fields++; if (profile.title) completed++; }
    if (profile.bio !== undefined) { fields++; if (profile.bio) completed++; }
    if (profile.location !== undefined) { fields++; if (profile.location) completed++; }
    if (profile.skills !== undefined) { fields++; if (profile.skills?.length) completed++; }
    if (profile.resume !== undefined) { fields++; if (profile.resume) completed++; }
    
    return fields > 0 ? Math.round((completed / fields) * 100) : 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <DashboardLayout
        pageTitle="Job Seeker Dashboard"
        userRole={UserRole.JOB_SEEKER}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                  title="Applications"
                  value={applications?.length || 0}
                  description="Total job applications"
                  icon={<ClipboardList className="h-6 w-6" />}
                  trend={applications?.length > 0 ? "positive" : "neutral"}
                />
                
                <StatsCard 
                  title="Saved Jobs"
                  value={savedJobs?.length || 0}
                  description="Jobs bookmarked for later"
                  icon={<BookmarkCheck className="h-6 w-6" />}
                  trend="neutral"
                />
                
                <StatsCard 
                  title="Profile Completion"
                  value={`${profileCompleteness()}%`}
                  description="Complete your profile to stand out"
                  icon={<UserRound className="h-6 w-6" />}
                  trend={profileCompleteness() > 80 ? "positive" : "negative"}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>
                      Your most recent job applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingApplications ? (
                      <p>Loading applications...</p>
                    ) : applications && applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((application: any) => (
                          <div key={application.id} className="flex items-center border-b border-gray-200 pb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">Job #{application.jobId}</h4>
                              <p className="text-sm text-gray-500">
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {application.status}
                            </span>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={() => handleTabChange("applications")}
                          className="w-full mt-2"
                        >
                          View All Applications
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-4">You haven't applied for any jobs yet.</p>
                        <Button asChild>
                          <Link href="/jobs">Browse Jobs</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended For You</CardTitle>
                    <CardDescription>
                      Jobs matching your skills and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Complete your profile to get personalized job recommendations.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTabChange("profile")}
                        className="mt-4"
                      >
                        Update Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription>
                    Track the status of your job applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Jobs</CardTitle>
                  <CardDescription>
                    Jobs you've bookmarked for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SavedJobsTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    Update your professional profile to stand out to employers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DashboardLayout>
      
      <Footer />
    </div>
  );
}
