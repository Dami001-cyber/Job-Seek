import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Job, Company } from "@shared/schema";
import { Bookmark, MapPin, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

interface JobCardProps {
  job: Job & { company?: Company | null };
  isSaved?: boolean;
  savedJobId?: number;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, isSaved = false, savedJobId, variant = 'default' }: JobCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isBookmarked, setIsBookmarked] = useState(isSaved);

  // Format salary range
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Not disclosed';
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
    return `Up to $${job.salaryMax?.toLocaleString()}`;
  };

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved-jobs", { jobId: job.id });
      return await res.json();
    },
    onSuccess: () => {
      setIsBookmarked(true);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      toast({
        title: "Job saved",
        description: "The job has been added to your saved jobs.",
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

  // Remove saved job mutation
  const removeSavedJobMutation = useMutation({
    mutationFn: async () => {
      if (!savedJobId) throw new Error("Job not saved");
      await apiRequest("DELETE", `/api/saved-jobs/${savedJobId}`);
    },
    onSuccess: () => {
      setIsBookmarked(false);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      toast({
        title: "Job removed",
        description: "The job has been removed from your saved jobs.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not remove job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSaveJob = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (isBookmarked) {
      removeSavedJobMutation.mutate();
    } else {
      saveJobMutation.mutate();
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {job.company?.logo ? (
                <img 
                  src={job.company.logo} 
                  alt={job.company?.name} 
                  className="h-10 w-10 object-contain rounded"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  {job.company?.name?.charAt(0) || "C"}
                </div>
              )}
              <div className="ml-3">
                <h3 className="font-medium text-gray-900 text-sm">{job.title}</h3>
                <p className="text-gray-500 text-xs">{job.company?.name}</p>
              </div>
            </div>
            <Button
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={toggleSaveJob}
              disabled={saveJobMutation.isPending || removeSavedJobMutation.isPending}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : 'text-gray-400'}`} />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {job.type}
            </Badge>
            {job.isRemote && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                Remote
              </Badge>
            )}
            {job.experienceLevel && (
              <Badge variant="outline" className="text-xs">
                {job.experienceLevel}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{job.location}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-primary font-medium"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {job.company?.logo ? (
              <img 
                src={job.company.logo} 
                alt={job.company?.name} 
                className="h-12 w-12 object-contain rounded"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                {job.company?.name?.charAt(0) || "C"}
              </div>
            )}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
              <p className="text-gray-500">{job.company?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost" 
            size="icon" 
            onClick={toggleSaveJob}
            disabled={saveJobMutation.isPending || removeSavedJobMutation.isPending}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-gray-400'}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
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
              {job.experienceLevel} Level
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location}</span>
          </div>
          <span className="font-medium text-gray-900">{formatSalary()}</span>
        </div>

        {job.description && (
          <p className="text-gray-500 mt-4 text-sm line-clamp-2">
            {job.description}
          </p>
        )}

        <div className="flex justify-between items-center mt-4">
          {job.createdAt && (
            <span className="text-xs text-gray-400">
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          )}
          <Button 
            variant="link" 
            className="text-primary hover:text-primary/90 p-0"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            View Details <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
