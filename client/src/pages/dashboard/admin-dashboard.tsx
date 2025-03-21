import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Job, Company } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Users,
  Briefcase,
  Building,
  Activity,
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Edit,
  Trash,
  User as UserIcon,
  Loader2,
  Eye
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [jobsSearchQuery, setJobsSearchQuery] = useState("");
  const [companiesSearchQuery, setCompaniesSearchQuery] = useState("");
  
  // Fetch users
  const { 
    data: users = [], 
    isLoading: isLoadingUsers 
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === 'admin', // Only fetch if user is authenticated and is admin
  });
  
  // Fetch jobs
  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs 
  } = useQuery<(Job & { company?: Company })[]>({
    queryKey: ["/api/jobs", "admin"],
    enabled: !!user && user.role === 'admin', // Only fetch if user is authenticated and is admin
  });
  
  // Fetch companies
  const { 
    data: companies = [], 
    isLoading: isLoadingCompanies 
  } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: !!user && user.role === 'admin', // Only fetch if user is authenticated and is admin
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${userId}`, { 
        active: status 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User status updated",
        description: "The user's status has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/jobs/${jobId}`, { 
        status 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", "admin"] });
      toast({
        title: "Job status updated",
        description: "The job status has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    if (!usersSearchQuery) return true;
    const query = usersSearchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  // Filter jobs based on search query
  const filteredJobs = jobs?.filter(job => {
    if (!jobsSearchQuery) return true;
    const query = jobsSearchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.company?.name?.toLowerCase().includes(query)
    );
  });

  // Filter companies based on search query
  const filteredCompanies = companies?.filter(company => {
    if (!companiesSearchQuery) return true;
    const query = companiesSearchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query) ||
      company.location?.toLowerCase().includes(query)
    );
  });

  // Calculate dashboard stats
  const stats = {
    totalUsers: users?.length || 0,
    jobSeekers: users?.filter(user => user.role === 'job_seeker').length || 0,
    employers: users?.filter(user => user.role === 'employer').length || 0,
    admins: users?.filter(user => user.role === 'admin').length || 0,
    totalJobs: jobs?.length || 0,
    activeJobs: jobs?.filter(job => job.status === 'active').length || 0,
    closedJobs: jobs?.filter(job => job.status === 'closed').length || 0,
    draftJobs: jobs?.filter(job => job.status === 'draft').length || 0,
    totalCompanies: companies?.length || 0,
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, jobs, and companies</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Users</h3>
              <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            {isLoadingUsers ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                Job Seekers: {stats.jobSeekers}
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                Employers: {stats.employers}
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-purple-500 mr-1"></span>
                Admins: {stats.admins}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Jobs Posted</h3>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            {isLoadingJobs ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalJobs}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                Active: {stats.activeJobs}
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                Closed: {stats.closedJobs}
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                Draft: {stats.draftJobs}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Companies</h3>
              <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Building className="h-5 w-5" />
              </div>
            </div>
            {isLoadingCompanies ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-1"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalCompanies}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Managing {stats.totalCompanies} registered companies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Site Activity</h3>
              <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              48
            </p>
            <p className="text-sm text-gray-600">
              Active users in the last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="users" className="flex-1 sm:flex-initial">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1 sm:flex-initial">
            <Briefcase className="h-4 w-4 mr-2" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex-1 sm:flex-initial">
            <Building className="h-4 w-4 mr-2" />
            Companies
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg">Manage Users</CardTitle>
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9"
                      value={usersSearchQuery}
                      onChange={(e) => setUsersSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="job_seeker">Job Seekers</SelectItem>
                      <SelectItem value="employer">Employers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingUsers ? (
                      Array(5).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                              <div className="ml-4">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {user.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={`${user.firstName} ${user.lastName}`} 
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span>
                                    {user.firstName?.charAt(0)}
                                    {user.lastName?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              user.role === 'job_seeker' ? "bg-blue-100 text-blue-800" :
                              user.role === 'employer' ? "bg-green-100 text-green-800" :
                              "bg-purple-100 text-purple-800"
                            }>
                              {user.role === 'job_seeker' ? 'Job Seeker' :
                               user.role === 'employer' ? 'Employer' : 'Admin'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.active ? (
                                  <DropdownMenuItem 
                                    onClick={() => updateUserStatusMutation.mutate({ userId: user.id, status: false })}
                                    disabled={updateUserStatusMutation.isPending}
                                  >
                                    <Ban className="h-4 w-4 mr-2 text-amber-600" />
                                    <span className="text-amber-600">Deactivate User</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => updateUserStatusMutation.mutate({ userId: user.id, status: true })}
                                    disabled={updateUserStatusMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    <span className="text-green-600">Activate User</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
                                      deleteUserMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  <Trash className="h-4 w-4 mr-2 text-red-600" />
                                  <span className="text-red-600">Delete User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg">Manage Jobs</CardTitle>
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-9"
                      value={jobsSearchQuery}
                      onChange={(e) => setJobsSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingJobs ? (
                      Array(5).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-5 w-36 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              <div className="ml-3 h-4 w-24 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredJobs && filteredJobs.length > 0 ? (
                      filteredJobs.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {job.company ? (
                                <>
                                  {job.company.logo ? (
                                    <img 
                                      src={job.company.logo} 
                                      alt={job.company.name} 
                                      className="h-8 w-8 rounded object-contain bg-white"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                      {job.company.name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="ml-3 text-sm text-gray-900">{job.company.name}</span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">Unknown Company</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.location}
                            {job.isRemote && <span className="ml-1">(Remote)</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              job.status === 'active' ? "bg-green-100 text-green-800" :
                              job.status === 'closed' ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {job.status !== 'active' ? (
                                  <DropdownMenuItem 
                                    onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: 'active' })}
                                    disabled={updateJobStatusMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    <span className="text-green-600">Activate Job</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: 'closed' })}
                                    disabled={updateJobStatusMutation.isPending}
                                  >
                                    <Ban className="h-4 w-4 mr-2 text-amber-600" />
                                    <span className="text-amber-600">Close Job</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No jobs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg">Manage Companies</CardTitle>
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search companies..."
                      className="pl-9"
                      value={companiesSearchQuery}
                      onChange={(e) => setCompaniesSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingCompanies ? (
                      Array(5).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded"></div>
                              <div className="ml-4 h-5 w-32 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-8 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredCompanies && filteredCompanies.length > 0 ? (
                      filteredCompanies.map(company => {
                        const companyJobs = jobs?.filter(job => job.companyId === company.id) || [];
                        
                        return (
                          <tr key={company.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {company.logo ? (
                                  <img 
                                    src={company.logo} 
                                    alt={company.name} 
                                    className="h-10 w-10 rounded object-contain bg-white border p-1"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                    {company.name?.charAt(0)}
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                  {company.website && (
                                    <a 
                                      href={company.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.industry || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.location || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.size || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {companyJobs.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Company
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/companies/${company.id}/edit`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Company
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/companies/${company.id}/jobs`)}>
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    View Jobs
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No companies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
