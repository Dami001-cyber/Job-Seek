import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JobSeekerProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }).optional(),
  location: z.string().optional(),
  skills: z.string().transform((val) => 
    val.split(",").map((skill) => skill.trim()).filter(Boolean)
  ),
  resume: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile, isLoading } = useQuery<JobSeekerProfile>({
    queryKey: ["/api/job-seeker-profile"],
    enabled: !!user && user.role === "job_seeker"
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: profile?.title || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      skills: profile?.skills ? profile.skills.join(", ") : "",
      resume: profile?.resume || "",
    },
  });

  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      form.reset({
        title: profile.title || "",
        bio: profile.bio || "",
        location: profile.location || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
        resume: profile.resume || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PUT", "/api/job-seeker-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-seeker-profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    setIsSubmitting(true);
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. React, JavaScript, UI Design" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-gray-500">
                  Enter skills separated by commas
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell employers about yourself, your experience, and your career goals..."
                    className="min-h-[150px]"
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
              Updating Profile
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}
