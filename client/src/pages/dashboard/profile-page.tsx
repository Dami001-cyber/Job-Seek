import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Profile } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Plus,
  Trash2,
  User,
  Upload,
  Briefcase,
  GraduationCap,
  ScrollText,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Schema for the personal info form
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

// Schema for education entry
const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

// Schema for experience entry
const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

// Schema for the profile form
const profileSchema = z.object({
  resumeUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  socialLinks: z.object({
    linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
    github: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
    twitter: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal("")),
    website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  }).optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    location: "",
  });

  // Personal info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      resumeUrl: "",
      portfolioUrl: "",
      socialLinks: {
        linkedin: "",
        github: "",
        twitter: "",
        website: "",
      },
    },
  });

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof personalInfoSchema>) => {
      const res = await apiRequest("PUT", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Personal information updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile when the data is loaded
  useEffect(() => {
    if (profile) {
      // Set skills
      if (profile.skills && Array.isArray(profile.skills)) {
        setSkills(profile.skills as string[]);
      }

      // Set education
      if (profile.education && Array.isArray(profile.education)) {
        setEducation(profile.education);
      }

      // Set experience
      if (profile.experience && Array.isArray(profile.experience)) {
        setExperience(profile.experience);
      }

      // Update profile form
      profileForm.reset({
        resumeUrl: profile.resumeUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || "",
          github: profile.socialLinks?.github || "",
          twitter: profile.socialLinks?.twitter || "",
          website: profile.socialLinks?.website || "",
        },
      });
    }
  }, [profile, profileForm]);

  // Handle personal info form submission
  const onPersonalInfoSubmit = (data: z.infer<typeof personalInfoSchema>) => {
    updateUserMutation.mutate(data);
  };

  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    // Combine all profile data
    const profileData = {
      ...data,
      skills,
      education,
      experience,
    };

    updateProfileMutation.mutate(profileData);
  };

  // Add a skill
  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (skills.includes(skillInput.trim())) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in your profile.",
        variant: "destructive",
      });
      return;
    }
    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Handle education form changes
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEducation({ ...newEducation, [name]: value });
  };

  // Handle education checkbox change
  const handleEducationCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setNewEducation({ ...newEducation, current: checked, endDate: checked ? "" : newEducation.endDate });
  };

  // Add education entry
  const addEducation = () => {
    try {
      educationSchema.parse(newEducation);
      setEducation([...education, newEducation]);
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
      setIsAddingEducation(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast({
          title: "Invalid education data",
          description: fieldErrors,
          variant: "destructive",
        });
      }
    }
  };

  // Remove education entry
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Handle experience form changes
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience({ ...newExperience, [name]: value });
  };

  // Handle experience checkbox change
  const handleExperienceCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setNewExperience({ ...newExperience, current: checked, endDate: checked ? "" : newExperience.endDate });
  };

  // Add experience entry
  const addExperience = () => {
    try {
      experienceSchema.parse(newExperience);
      setExperience([...experience, newExperience]);
      setNewExperience({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        location: "",
      });
      setIsAddingExperience(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast({
          title: "Invalid experience data",
          description: fieldErrors,
          variant: "destructive",
        });
      }
    }
  };

  // Remove experience entry
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    let total = 5; // total number of sections

    // Check if profile has basic info
    if (user.firstName && user.lastName && user.email) completed++;
    // Check if profile has skills
    if (skills.length > 0) completed++;
    // Check if profile has education
    if (education.length > 0) completed++;
    // Check if profile has experience
    if (experience.length > 0) completed++;
    // Check if profile has resume
    if (profileForm.getValues().resumeUrl) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletionPercentage = calculateProfileCompletion();

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal and professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <Card>
              <CardHeader className="border-b px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                  <TabsList className="mt-2 sm:mt-0">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      <User className="h-4 w-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Professional
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="m-0">
                <CardContent className="pt-6">
                  <Form {...personalInfoForm}>
                    <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={personalInfoForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalInfoForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={personalInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell employers about yourself in a few sentences..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="ml-auto"
                        disabled={updateUserMutation.isPending || !personalInfoForm.formState.isDirty}
                      >
                        {updateUserMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>

              {/* Professional Info Tab */}
              <TabsContent value="professional" className="m-0">
                <CardContent className="pt-6">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                      {/* Resume & Portfolio Section */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Resume & Portfolio</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="resumeUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resume URL</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://example.com/resume.pdf" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ScrollText className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Link to your resume (Google Drive, Dropbox, etc.)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="portfolioUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Portfolio URL</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://myportfolio.com" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Link to your portfolio or personal website
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Social Links Section */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="socialLinks.linkedin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Linkedin className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="socialLinks.github"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GitHub</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://github.com/yourusername" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Github className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="socialLinks.twitter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://twitter.com/yourusername" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Twitter className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="socialLinks.website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Personal Website</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="https://yourwebsite.com" {...field} className="pl-10" />
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Skills Section */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="relative flex-grow">
                                <Input
                                  placeholder="Add a skill (e.g., JavaScript, Project Management)"
                                  value={skillInput}
                                  onChange={(e) => setSkillInput(e.target.value)}
                                  className="pl-10"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addSkill();
                                    }
                                  }}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Sparkles className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                onClick={addSkill} 
                                className="ml-2"
                                variant="secondary"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="py-1 px-3 rounded-full">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 text-gray-400 hover:text-gray-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {skills.length === 0 && (
                                <p className="text-sm text-gray-500">No skills added yet. Add skills to showcase your expertise.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="ml-auto"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingEducation(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isAddingEducation ? (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-medium">Add Education</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsAddingEducation(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <Input 
                          name="institution"
                          value={newEducation.institution}
                          onChange={handleEducationChange}
                          placeholder="University or School Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <Input 
                          name="degree"
                          value={newEducation.degree}
                          onChange={handleEducationChange}
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                      <Input 
                        name="field"
                        value={newEducation.field}
                        onChange={handleEducationChange}
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <Input 
                          name="startDate"
                          type="date"
                          value={newEducation.startDate}
                          onChange={handleEducationChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input 
                          name="endDate"
                          type="date"
                          value={newEducation.endDate}
                          onChange={handleEducationChange}
                          disabled={newEducation.current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        id="currentEducation"
                        checked={newEducation.current}
                        onChange={handleEducationCheckbox}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="currentEducation" className="ml-2 block text-sm text-gray-700">
                        I am currently studying here
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Textarea 
                        name="description"
                        value={newEducation.description}
                        onChange={handleEducationChange}
                        placeholder="Achievements, activities, etc."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddingEducation(false)}
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={addEducation}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {education.length > 0 ? (
                      <div className="space-y-6">
                        {education.map((edu, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{edu.institution}</h3>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeEducation(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-700">{edu.degree}, {edu.field}</p>
                            <p className="text-gray-500 text-sm">
                              {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                            </p>
                            {edu.description && (
                              <p className="text-gray-600 mt-2 text-sm">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="mb-1">No education history added yet</p>
                        <p className="text-sm">Add your educational background to enhance your profile</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => updateProfileMutation.mutate({ education })}
                  disabled={updateProfileMutation.isPending || education.length === 0}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Education"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Experience
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingExperience(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isAddingExperience ? (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-medium">Add Experience</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsAddingExperience(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <Input 
                          name="company"
                          value={newExperience.company}
                          onChange={handleExperienceChange}
                          placeholder="Company Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <Input 
                          name="position"
                          value={newExperience.position}
                          onChange={handleExperienceChange}
                          placeholder="Job Title"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <Input 
                        name="location"
                        value={newExperience.location}
                        onChange={handleExperienceChange}
                        placeholder="City, Country or Remote"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <Input 
                          name="startDate"
                          type="date"
                          value={newExperience.startDate}
                          onChange={handleExperienceChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input 
                          name="endDate"
                          type="date"
                          value={newExperience.endDate}
                          onChange={handleExperienceChange}
                          disabled={newExperience.current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        id="currentPosition"
                        checked={newExperience.current}
                        onChange={handleExperienceCheckbox}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="currentPosition" className="ml-2 block text-sm text-gray-700">
                        I currently work here
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Textarea 
                        name="description"
                        value={newExperience.description}
                        onChange={handleExperienceChange}
                        placeholder="Describe your responsibilities and achievements"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddingExperience(false)}
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={addExperience}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {experience.length > 0 ? (
                      <div className="space-y-6">
                        {experience.map((exp, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{exp.position}</h3>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeExperience(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-700">{exp.company}</p>
                            <div className="flex flex-wrap gap-x-4 text-gray-500 text-sm">
                              <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                              {exp.location && <span>{exp.location}</span>}
                            </div>
                            {exp.description && (
                              <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="mb-1">No work experience added yet</p>
                        <p className="text-sm">Add your work history to showcase your professional experience</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => updateProfileMutation.mutate({ experience })}
                  disabled={updateProfileMutation.isPending || experience.length === 0}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Experience"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader className="text-center pb-2 space-y-0">
              <div className="mx-auto relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-semibold border-4 border-white shadow">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full p-1 h-8 w-8"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{user?.firstName} {user?.lastName}</CardTitle>
              <CardDescription className="text-gray-500">
                {user?.role === 'job_seeker' ? 'Job Seeker' : user?.role === 'employer' ? 'Employer' : 'Admin'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              {user?.location && <p className="text-gray-600 text-sm mb-3">{user.location}</p>}
              {user?.email && <p className="text-gray-600 text-sm">{user.email}</p>}
              {user?.phone && <p className="text-gray-600 text-sm">{user.phone}</p>}
            </CardContent>
          </Card>

          {/* Profile Completion Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">{profileCompletionPercentage}% Complete</span>
                <span className="text-primary text-sm font-medium">
                  {Math.round(profileCompletionPercentage / 20)}/5 Sections
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2" 
                  style={{ width: `${profileCompletionPercentage}%` }}
                ></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${user?.firstName && user?.lastName && user?.email ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {user?.firstName && user?.lastName && user?.email ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Personal Information</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {user?.firstName && user?.lastName && user?.email ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${skills.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {skills.length > 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Skills</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {skills.length > 0 ? `${skills.length} skills` : 'No skills added'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${education.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {education.length > 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Education</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {education.length > 0 ? `${education.length} entries` : 'No education added'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${experience.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {experience.length > 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Experience</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {experience.length > 0 ? `${experience.length} entries` : 'No experience added'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${profileForm.getValues().resumeUrl ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {profileForm.getValues().resumeUrl ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Resume</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {profileForm.getValues().resumeUrl ? 'Added' : 'Not added'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Profile Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-3">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>A complete profile increases your chances of getting noticed by employers.</p>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>List skills that are relevant to the jobs you're seeking.</p>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>Use your bio to highlight your career goals and unique value proposition.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
