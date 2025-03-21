import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/ui/job-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SavedJob, Job, Company } from "@shared/schema";
import { useLocation } from "wouter";
import { 
  Search, 
  BookmarkX, 
  Briefcase,
  Calendar,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SavedJobsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "company">("recent");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [savedJobToRemove, setSavedJobToRemove] = useState<number | null>(null);
  
  // Fetch saved jobs with job and company details
  const { 
    data: savedJobs, 
    isLoading, 
    error 
  } = useQuery<(SavedJob & { job?: Job & { company?: Company } })[]>({
    queryKey: ["/api/saved-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/saved-jobs");
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      return res.json();
    },
  });

  // Remove saved job mutation
  const removeSavedJobMutation = useMutation({
    mutationFn: async (savedJobId: number) => {
      await apiRequest("DELETE", `/api/saved-jobs/${savedJobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      toast({
        title: "Job removed",
        description: "The job has been removed from your saved jobs.",
      });
      setRemoveDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle remove saved job
  const handleRemoveSavedJob = (savedJobId: number) => {
    setSavedJobToRemove(savedJobId);
    setRemoveDialogOpen(true);
  };

  // Confirm remove saved job
  const confirmRemoveSavedJob = () => {
    if (savedJobToRemove) {
      removeSavedJobMutation.mutate(savedJobToRemove);
    }
  };

  // Filter saved jobs based on search query
  const filteredSavedJobs = savedJobs?.filter(savedJob => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      savedJob.job?.title?.toLowerCase().includes(query) ||
      savedJob.job?.company?.name?.toLowerCase().includes(query) ||
      savedJob.job?.location?.toLowerCase().includes(query)
    );
  });

  // Sort saved jobs based on selected option
  const sortedSavedJobs = [...(filteredSavedJobs || [])].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "title") {
      return (a.job?.title || "").localeCompare(b.job?.title || "");
    } else if (sortBy === "company") {
      return (a.job?.company?.name || "").localeCompare(b.job?.company?.name || "");
    }
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Manage the jobs you've saved for later</p>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-5">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              <span>
                {isLoading ? "Loading saved jobs..." : `${sortedSavedJobs?.length || 0} Saved Jobs`}
              </span>
            </CardTitle>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search saved jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-60 md:w-72"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort by
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("recent")}
                    className={sortBy === "recent" ? "bg-gray-100" : ""}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("title")}
                    className={sortBy === "title" ? "bg-gray-100" : ""}
                  >
                    <span className="font-mono mr-2">A→Z</span>
                    Job Title
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("company")}
                    className={sortBy === "company" ? "bg-gray-100" : ""}
                  >
                    <span className="font-mono mr-2">A→Z</span>
                    Company Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading saved jobs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <BookmarkX className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Saved Jobs</h3>
              <p className="text-gray-600 mb-4">Failed to load your saved jobs. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : sortedSavedJobs && sortedSavedJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedSavedJobs.map((savedJob) => (
                <div key={savedJob.id} className="relative group">
                  <JobCard 
                    job={savedJob.job!} 
                    isSaved={true}
                    savedJobId={savedJob.id}
                    variant="compact"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white"
                      onClick={() => handleRemoveSavedJob(savedJob.id)}
                    >
                      <BookmarkX className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
                      Saved {new Date(savedJob.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Briefcase className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery ? "No matching saved jobs found" : "No saved jobs yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "Start bookmarking jobs you're interested in to view them later."}
              </p>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job from your saved list? You can always save it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemoveSavedJob}
              disabled={removeSavedJobMutation.isPending}
            >
              {removeSavedJobMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
