import { Job, Company } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookmarkIcon, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JobCardProps {
  job: Job;
  company?: Company;
  isSaved?: boolean;
  onSave?: () => void;
}

export default function JobCard({ job, company, isSaved, onSave }: JobCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/saved-jobs", { jobId: job.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      toast({
        title: "Job saved",
        description: "This job has been added to your saved jobs.",
      });
      if (onSave) onSave();
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
      return;
    }
    
    saveJobMutation.mutate();
  };

  // Generate company initials if no logo is available
  const companyInitials = company?.name 
    ? company.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
    : job.companyId.toString().substring(0, 2);

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-10 w-10 object-contain"
              />
            ) : (
              <span className="text-indigo-500 font-bold text-lg">{companyInitials}</span>
            )}
          </div>
          {job.createdAt && new Date(job.createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-none">
              New
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
        <p className="text-sm text-gray-700 mb-3">{company?.name || `Company ${job.companyId}`}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location} {job.isRemote && "(Remote)"}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-primary-100 text-primary-800 border-none">
            {job.type}
          </Badge>
          
          {job.skills && job.skills.slice(0, 2).map((skill, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={index % 2 === 0 
                ? "bg-indigo-100 text-indigo-800 border-none" 
                : "bg-blue-100 text-blue-800 border-none"
              }
            >
              {skill}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-medium">{job.salary || "Competitive"}</span>
          <div className="flex space-x-2">
            {user?.role === "job_seeker" && !isSaved && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSaveJob}
                disabled={saveJobMutation.isPending}
              >
                <BookmarkIcon className="h-5 w-5" />
              </Button>
            )}
            <Button asChild variant="link" className="text-primary font-medium text-sm">
              <Link href={`/jobs/${job.id}`}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
