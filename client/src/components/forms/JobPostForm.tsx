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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface JobPostFormProps {
  existingJob?: Job;
  onSuccess?: () => void;
}

const jobSchema = z.object({
  title: z.string().min(3, {
    message: "Job title must be at least 3 characters.",
  }),
  description: z.string().min(30, {
    message: "Job description must be at least 30 characters.",
  }),
  location: z.string().min(2, {
    message: "Location is required.",
  }),
  salary: z.string().optional(),
  type: z.string().min(1, {
    message: "Job type is required.",
  }),
  skills: z.string().transform((val) => 
    val.split(",").map((skill) => skill.trim()).filter(Boolean)
  ),
  isRemote: z.boolean().default(false),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function JobPostForm({ existingJob, onSuccess }: JobPostFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: existingJob 
      ? {
          title: existingJob.title,
          description: existingJob.description,
          location: existingJob.location,
          salary: existingJob.salary || "",
          type: existingJob.type,
          skills: existingJob.skills ? existingJob.skills.join(", ") : "",
          isRemote: existingJob.isRemote || false,
        }
      : {
          title: "",
          description: "",
          location: "",
          salary: "",
          type: "Full-time",
          skills: "",
          isRemote: false,
        },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      if (existingJob) {
        await apiRequest("PUT", `/api/jobs/${existingJob.id}`, data);
      } else {
        await apiRequest("POST", "/api/jobs", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: existingJob ? "Job updated" : "Job posted",
        description: existingJob 
          ? "Your job has been updated successfully." 
          : "Your job has been posted successfully.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: existingJob ? "Failed to update job" : "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: JobFormValues) => {
    setIsSubmitting(true);
    createJobMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $80k - $100k" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isRemote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remote Position</FormLabel>
                  <FormDescription>
                    This position can be performed remotely
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. React, TypeScript, Node.js" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Enter skills separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the job responsibilities, requirements, and benefits..."
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
              {existingJob ? "Updating Job" : "Posting Job"}
            </>
          ) : (
            existingJob ? "Update Job" : "Post Job"
          )}
        </Button>
      </form>
    </Form>
  );
}
