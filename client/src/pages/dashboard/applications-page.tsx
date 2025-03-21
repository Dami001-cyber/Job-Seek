import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Application, Job, Company } from "@shared/schema";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Briefcase,
  Building,
  MoreHorizontal,
  Eye,
  FileText,
  Loader2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State management
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewApplication, setViewApplication] = useState<(Application & { job?: Job, company?: Company }) | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<number | null>(null);
  
  // Fetch applications based on user role
  const { 
    data: applications, 
    isLoading,
    error 
  } = useQuery<(Application & { job?: Job, company?: Company })[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  // Withdraw application mutation
  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const res = await apiRequest("DELETE", `/api/applications/${applicationId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application withdrawn",
        description: "Your application has been successfully withdrawn.",
      });
      setWithdrawDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error withdrawing application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update application status mutation (for employers)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/applications/${applicationId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status updated",
        description: "The application status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter applications based on tab selection and search query
  const filteredApplications = applications?.filter(app => {
    // First, filter by status tab
    if (filter !== "all" && app.status !== filter) {
      return false;
    }

    // Then filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.job?.title?.toLowerCase().includes(query) ||
        app.company?.name?.toLowerCase().includes(query) ||
        app.job?.location?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle view application details
  const handleViewApplication = (application: Application & { job?: Job, company?: Company }) => {
    setViewApplication(application);
  };

  // Handle withdraw application
  const handleWithdrawApplication = (applicationId: number) => {
    setApplicationToWithdraw(applicationId);
    setWithdrawDialogOpen(true);
  };

  // Confirm withdraw application
  const confirmWithdrawApplication = () => {
    if (applicationToWithdraw) {
      withdrawMutation.mutate(applicationToWithdraw);
    }
  };

  // Get badge variant based on application status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Reviewed</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Interview</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200">Accepted</Badge>;
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Applications</h2>
          <p className="text-gray-600 mb-6">Failed to load your applications. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">
          {user?.role === 'job_seeker' 
            ? 'Track and manage your job applications' 
            : 'Review and manage candidate applications'}
        </p>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-5">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg">Applications</CardTitle>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-60 md:w-72"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value)}
                >
                  <SelectTrigger className="w-32 md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="list" className="w-full">
            <div className="border-b px-6 py-3">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="p-0">
              {filteredApplications && filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{application.job?.title || "Unknown Position"}</div>
                            <div className="text-sm text-gray-500 mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              {application.job?.location || "Unknown Location"}
                              {application.job?.isRemote && <span className="ml-1">(Remote)</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {application.company?.logo ? (
                                <img
                                  src={application.company.logo}
                                  alt={application.company.name}
                                  className="h-8 w-8 rounded object-contain bg-gray-50 border border-gray-200 p-1 mr-3"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                                  <Building className="h-4 w-4" />
                                </div>
                              )}
                              <div className="text-sm text-gray-900">{application.company?.name || "Unknown Company"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(application.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(application.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewApplication(application)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {application.job?.id && (
                                  <DropdownMenuItem onClick={() => navigate(`/jobs/${application.job.id}`)}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Job Posting
                                  </DropdownMenuItem>
                                )}
                                {user?.role === 'job_seeker' && application.status === 'pending' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleWithdrawApplication(application.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Withdraw Application
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {user?.role === 'employer' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    {application.status === 'pending' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: 'reviewed' })}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-blue-600">Mark as Reviewed</span>
                                      </DropdownMenuItem>
                                    )}
                                    {application.status !== 'interview' && application.status !== 'rejected' && application.status !== 'accepted' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: 'interview' })}
                                      >
                                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                        <span className="text-green-600">Move to Interview</span>
                                      </DropdownMenuItem>
                                    )}
                                    {application.status !== 'rejected' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: 'rejected' })}
                                      >
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                        <span className="text-red-600">Reject Application</span>
                                      </DropdownMenuItem>
                                    )}
                                    {application.status !== 'accepted' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: 'accepted' })}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                                        <span className="text-purple-600">Accept Candidate</span>
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {filter !== "all" 
                      ? `You don't have any ${filter} applications.` 
                      : searchQuery 
                        ? "No applications match your search criteria." 
                        : user?.role === 'job_seeker' 
                          ? "You haven't applied to any jobs yet. Start applying to find your next opportunity!" 
                          : "No applications have been received yet for your job postings."}
                  </p>
                  {user?.role === 'job_seeker' && (
                    <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
                  )}
                  {user?.role === 'employer' && (
                    <Button onClick={() => navigate("/dashboard/post-job")}>Post a Job</Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="p-0">
              <div className="p-6 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Calendar View Coming Soon</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  We're working on a calendar view to help you visualize your application timeline and interview schedule.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      {viewApplication && (
        <Dialog open={!!viewApplication} onOpenChange={() => setViewApplication(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Application Details</DialogTitle>
              <DialogDescription>
                Applied on {new Date(viewApplication.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="border-b pb-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900">{viewApplication.job?.title || "Unknown Position"}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{viewApplication.company?.name || "Unknown Company"}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {viewApplication.job?.location || "Unknown Location"}
                      {viewApplication.job?.isRemote && " (Remote)"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{viewApplication.job?.type || "Unknown Type"}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-start md:items-end space-y-2">
                  <div>
                    {getStatusBadge(viewApplication.status)}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Last updated: {new Date(viewApplication.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {viewApplication.resumeUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Resume</h4>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <a 
                      href={viewApplication.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      View Resume <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
              
              {viewApplication.coverLetter && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Cover Letter</h4>
                  <div className="p-4 bg-gray-50 rounded-md text-gray-700 text-sm whitespace-pre-line">
                    {viewApplication.coverLetter}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Application Timeline</h4>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-xs text-gray-500">{new Date(viewApplication.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {viewApplication.status !== 'pending' && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Eye className="h-3 w-3" />
                        </div>
                        <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Application Reviewed</p>
                        <p className="text-xs text-gray-500">{new Date(viewApplication.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {(viewApplication.status === 'interview' || viewApplication.status === 'accepted') && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <Calendar className="h-3 w-3" />
                        </div>
                        <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interview Stage</p>
                        <p className="text-xs text-gray-500">{new Date(viewApplication.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewApplication.status === 'accepted' && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Application Accepted</p>
                        <p className="text-xs text-gray-500">{new Date(viewApplication.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewApplication.status === 'rejected' && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                          <XCircle className="h-3 w-3" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Application Rejected</p>
                        <p className="text-xs text-gray-500">{new Date(viewApplication.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setViewApplication(null)}
              >
                Close
              </Button>
              
              <div className="space-x-2">
                {user?.role === 'job_seeker' && viewApplication.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setApplicationToWithdraw(viewApplication.id);
                      setWithdrawDialogOpen(true);
                      setViewApplication(null);
                    }}
                  >
                    Withdraw Application
                  </Button>
                )}
                
                {viewApplication.job?.id && (
                  <Button 
                    onClick={() => {
                      navigate(`/jobs/${viewApplication.job!.id}`);
                      setViewApplication(null);
                    }}
                  >
                    View Job Posting
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Withdraw Application Confirmation Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setWithdrawDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmWithdrawApplication}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
