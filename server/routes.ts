import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSchema, insertJobApplicationSchema, insertSavedJobSchema, insertJobSeekerProfileSchema, insertCompanySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  // Jobs
  app.get("/api/jobs", async (req, res, next) => {
    try {
      const { title, location, type, isRemote, minSalary, skills } = req.query;
      
      // Build filters object
      const filters: any = {};
      if (title) filters.title = title as string;
      if (location) filters.location = location as string;
      if (type) filters.type = type as string;
      if (isRemote) filters.isRemote = isRemote === "true";
      if (skills) filters.skills = (skills as string).split(",");
      
      // Get all active and approved jobs
      let jobs = await storage.getAllJobs({ ...filters, isActive: true, isApproved: true });
      
      // Apply salary filter if specified
      if (minSalary) {
        const minSalaryNum = parseInt(minSalary as string);
        jobs = jobs.filter(job => {
          // Extract number from salary string (e.g. "$80k - $100k" -> 80000)
          const salaryMatch = job.salary?.match(/\$?(\d+)k/);
          if (salaryMatch && salaryMatch[1]) {
            const jobMinSalary = parseInt(salaryMatch[1]) * 1000;
            return jobMinSalary >= minSalaryNum;
          }
          return true;
        });
      }
      
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/jobs/:id", async (req, res, next) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/jobs", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user is an employer
      if (req.user.role !== "employer") {
        return res.status(403).json({ message: "Only employers can post jobs" });
      }

      // Get the company for this employer
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Validate job data
      const jobData = insertJobSchema.parse({
        ...req.body,
        companyId: company.id
      });

      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/jobs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user is the employer who created this job or an admin
      const company = await storage.getCompany(job.companyId);
      if (req.user.role !== "admin" && (!company || company.userId !== req.user.id)) {
        return res.status(403).json({ message: "Not authorized to edit this job" });
      }

      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/jobs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user is the employer who created this job or an admin
      const company = await storage.getCompany(job.companyId);
      if (req.user.role !== "admin" && (!company || company.userId !== req.user.id)) {
        return res.status(403).json({ message: "Not authorized to delete this job" });
      }

      await storage.deleteJob(jobId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Job applications
  app.post("/api/job-applications", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user is a job seeker
      if (req.user.role !== "job_seeker") {
        return res.status(403).json({ message: "Only job seekers can apply for jobs" });
      }

      // Validate application data
      const applicationData = insertJobApplicationSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if job exists and is active
      const job = await storage.getJob(applicationData.jobId);
      if (!job || !job.isActive || !job.isApproved) {
        return res.status(404).json({ message: "Job not found or inactive" });
      }

      // Check if user already applied
      const userApplications = await storage.getJobApplicationsByUserId(req.user.id);
      const alreadyApplied = userApplications.some(app => app.jobId === applicationData.jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      const application = await storage.createJobApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/job-applications", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      let applications = [];
      
      if (req.user.role === "job_seeker") {
        // Job seekers can see their own applications
        applications = await storage.getJobApplicationsByUserId(req.user.id);
      } else if (req.user.role === "employer") {
        // Employers can see applications for their jobs
        const company = await storage.getCompanyByUserId(req.user.id);
        if (!company) {
          return res.status(404).json({ message: "Company not found" });
        }
        
        // Get all jobs from this company
        const companyJobs = await storage.getJobsByCompanyId(company.id);
        
        // Get applications for each job
        applications = [];
        for (const job of companyJobs) {
          const jobApplications = await storage.getJobApplicationsByJobId(job.id);
          applications.push(...jobApplications);
        }
      } else if (req.user.role === "admin") {
        // Admins can see all applications
        applications = [];
        const allJobs = await storage.getAllJobs();
        for (const job of allJobs) {
          const jobApplications = await storage.getJobApplicationsByJobId(job.id);
          applications.push(...jobApplications);
        }
      }
      
      res.json(applications);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/job-applications/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getJobApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check authorization
      if (req.user.role === "job_seeker" && application.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      } else if (req.user.role === "employer") {
        // Check if the job belongs to this employer
        const job = await storage.getJob(application.jobId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        
        const company = await storage.getCompany(job.companyId);
        if (!company || company.userId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized to update this application" });
        }
        
        // Employers can only update the status
        if (Object.keys(req.body).filter(key => key !== "status").length > 0) {
          return res.status(400).json({ message: "Employers can only update the application status" });
        }
      }

      const updatedApplication = await storage.updateJobApplication(applicationId, req.body);
      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  });

  // Saved jobs
  app.post("/api/saved-jobs", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user is a job seeker
      if (req.user.role !== "job_seeker") {
        return res.status(403).json({ message: "Only job seekers can save jobs" });
      }

      // Validate data
      const savedJobData = insertSavedJobSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if job exists
      const job = await storage.getJob(savedJobData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if already saved
      const userSavedJobs = await storage.getSavedJobsByUserId(req.user.id);
      const alreadySaved = userSavedJobs.some(saved => saved.jobId === savedJobData.jobId);
      
      if (alreadySaved) {
        return res.status(400).json({ message: "Job already saved" });
      }

      const savedJob = await storage.createSavedJob(savedJobData);
      res.status(201).json(savedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/saved-jobs", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Only job seekers can access saved jobs
      if (req.user.role !== "job_seeker") {
        return res.status(403).json({ message: "Access denied" });
      }

      const savedJobs = await storage.getSavedJobsByUserId(req.user.id);
      
      // Get full job details for each saved job
      const savedJobsWithDetails = await Promise.all(
        savedJobs.map(async (savedJob) => {
          const job = await storage.getJob(savedJob.jobId);
          return {
            ...savedJob,
            job
          };
        })
      );
      
      res.json(savedJobsWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/saved-jobs/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const savedJobId = parseInt(req.params.id);
      const savedJob = await storage.getSavedJob(savedJobId);
      
      if (!savedJob) {
        return res.status(404).json({ message: "Saved job not found" });
      }

      // Check if the saved job belongs to this user
      if (savedJob.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this saved job" });
      }

      await storage.deleteSavedJob(savedJobId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Job seeker profile
  app.get("/api/job-seeker-profile", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const profile = await storage.getJobSeekerProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/job-seeker-profile", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Only job seekers can update their profiles
      if (req.user.role !== "job_seeker") {
        return res.status(403).json({ message: "Only job seekers can update profiles" });
      }

      const profile = await storage.getJobSeekerProfileByUserId(req.user.id);
      
      if (!profile) {
        // Create new profile if it doesn't exist
        const newProfileData = insertJobSeekerProfileSchema.parse({
          ...req.body,
          userId: req.user.id
        });
        
        const newProfile = await storage.createJobSeekerProfile(newProfileData);
        return res.status(201).json(newProfile);
      }

      // Update existing profile
      const updatedProfile = await storage.updateJobSeekerProfile(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      next(error);
    }
  });

  // Company
  app.get("/api/company", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/company", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Only employers can update their company
      if (req.user.role !== "employer") {
        return res.status(403).json({ message: "Only employers can update company details" });
      }

      const company = await storage.getCompanyByUserId(req.user.id);
      
      if (!company) {
        // Create new company if it doesn't exist
        const newCompanyData = insertCompanySchema.parse({
          ...req.body,
          userId: req.user.id
        });
        
        const newCompany = await storage.createCompany(newCompanyData);
        return res.status(201).json(newCompany);
      }

      // Update existing company
      const updatedCompany = await storage.updateCompany(company.id, req.body);
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      next(error);
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/users/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/jobs/:id/approve", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const updatedJob = await storage.updateJob(jobId, { isApproved: true });
      res.json(updatedJob);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
