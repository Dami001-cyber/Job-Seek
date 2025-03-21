import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { 
  insertJobSchema, 
  insertApplicationSchema, 
  insertSavedJobSchema, 
  insertJobSeekerProfileSchema, 
  insertEmployerProfileSchema 
} from "@shared/schema";

// Auth middleware to ensure user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Role-based middleware
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, location, type, remote, minSalary, maxSalary, page = 1, limit = 10 } = req.query;
      
      const jobs = await storage.getJobs({
        search: search as string,
        location: location as string,
        type: type as string,
        remote: remote === 'true',
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(Number(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", isAuthenticated, hasRole(['employer', 'admin']), async (req, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        employerId: req.user!.id
      });
      
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, hasRole(['employer', 'admin']), async (req, res) => {
    try {
      const jobId = Number(req.params.id);
      const existingJob = await storage.getJob(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user is the owner or an admin
      if (existingJob.employerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this job" });
      }
      
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.updateJob(jobId, {
        ...jobData,
        employerId: existingJob.employerId // Ensure employerId doesn't change
      });
      
      res.json(job);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, hasRole(['employer', 'admin']), async (req, res) => {
    try {
      const jobId = Number(req.params.id);
      const existingJob = await storage.getJob(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user is the owner or an admin
      if (existingJob.employerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this job" });
      }
      
      await storage.deleteJob(jobId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Applications routes
  app.post("/api/applications", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        jobSeekerId: req.user!.id
      });
      
      // Check if already applied
      const existingApplication = await storage.getApplicationByJobAndUser(
        applicationData.jobId, 
        req.user!.id
      );
      
      if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      let applications;
      
      if (req.user!.role === 'job_seeker') {
        applications = await storage.getApplicationsByJobSeeker(req.user!.id);
      } else if (req.user!.role === 'employer') {
        applications = await storage.getApplicationsByEmployer(req.user!.id);
      } else if (req.user!.role === 'admin') {
        applications = await storage.getAllApplications();
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put("/api/applications/:id/status", isAuthenticated, hasRole(['employer', 'admin']), async (req, res) => {
    try {
      const applicationId = Number(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'reviewing', 'interview', 'rejected', 'accepted'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const existingApplication = await storage.getApplication(applicationId);
      
      if (!existingApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if employer is authorized to update this application
      if (req.user!.role === 'employer') {
        const job = await storage.getJob(existingApplication.jobId);
        
        if (!job || job.employerId !== req.user!.id) {
          return res.status(403).json({ message: "Not authorized to update this application" });
        }
      }
      
      const application = await storage.updateApplicationStatus(applicationId, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Saved Jobs routes
  app.post("/api/saved-jobs", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const savedJobData = insertSavedJobSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if already saved
      const existingSavedJob = await storage.getSavedJobByJobAndUser(
        savedJobData.jobId, 
        req.user!.id
      );
      
      if (existingSavedJob) {
        return res.status(400).json({ message: "Job already saved" });
      }
      
      const savedJob = await storage.saveJob(savedJobData);
      res.status(201).json(savedJob);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error saving job:", error);
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  app.get("/api/saved-jobs", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const savedJobs = await storage.getSavedJobsByUser(req.user!.id);
      res.json(savedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  app.delete("/api/saved-jobs/:jobId", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const jobId = Number(req.params.jobId);
      await storage.deleteSavedJob(jobId, req.user!.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing saved job:", error);
      res.status(500).json({ message: "Failed to remove saved job" });
    }
  });

  // User Profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      let profile;
      
      if (req.user!.role === 'job_seeker') {
        profile = await storage.getJobSeekerProfile(req.user!.id);
      } else if (req.user!.role === 'employer') {
        profile = await storage.getEmployerProfile(req.user!.id);
      } else {
        return res.status(400).json({ message: "Invalid user role" });
      }
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/job-seeker", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      // Check if profile already exists
      const existingProfile = await storage.getJobSeekerProfile(req.user!.id);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists, use PUT to update" });
      }
      
      const profileData = insertJobSeekerProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const profile = await storage.createJobSeekerProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile/job-seeker", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const profileData = insertJobSeekerProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const profile = await storage.updateJobSeekerProfile(req.user!.id, profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/profile/employer", isAuthenticated, hasRole(['employer']), async (req, res) => {
    try {
      // Check if profile already exists
      const existingProfile = await storage.getEmployerProfile(req.user!.id);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists, use PUT to update" });
      }
      
      const profileData = insertEmployerProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const profile = await storage.createEmployerProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile/employer", isAuthenticated, hasRole(['employer']), async (req, res) => {
    try {
      const profileData = insertEmployerProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const profile = await storage.updateEmployerProfile(req.user!.id, profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/jobs/:id/approve", isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const jobId = Number(req.params.id);
      const { approved } = req.body;
      
      const job = await storage.approveJob(jobId, approved);
      res.json(job);
    } catch (error) {
      console.error("Error approving job:", error);
      res.status(500).json({ message: "Failed to approve job" });
    }
  });

  app.put("/api/admin/users/:id/status", isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { active } = req.body;
      
      const user = await storage.setUserStatus(userId, active);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
