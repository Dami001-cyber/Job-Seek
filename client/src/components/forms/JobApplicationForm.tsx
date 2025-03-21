import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface JobApplicationFormProps {
  job: Job;
  onSuccess?: () => void;
}

const applicationSchema = z.object({
  coverLetter: z.string().min(10, {
    message: "Cover letter must be at least 10 characters.",
  }),
  resume: z.string().min(5, {
    message: "Please provide a resume link or upload a resume.",
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function JobApplicationForm({ job, onSuccess }: JobApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
      resume: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      const payload = {
        jobId: job.id,
        ...data
      };
      await apiRequest("POST", "/api/job-applications", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    applyMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="text-center p-4">
        <p>Please log in to apply for this job.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Apply for {job.title}</h3>
          
          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Link to your resume" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="relative h-[1px] bg-gray-200">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  OR
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="resume-upload">Upload Resume</Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const fileName = e.target.files[0].name;
                  form.setValue("resume", `Uploaded: ${fileName}`);
                }
              }}
              className="mt-1"
            />
          </div>

          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us why you're a good fit for this position..."
                    className="min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Submitting Application
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  );
}
