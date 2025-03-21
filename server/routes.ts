import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSchema, insertCompanySchema, insertApplicationSchema, insertProfileSchema, insertSavedJobSchema } from "@shared/schema";
import { z } from "zod";

// Helper middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Helper middleware to check for specific roles
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    return next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, type, experienceLevel, isRemote, location } = req.query;
      
      // Filter by job attributes
      const filters: any = {};
      if (type) filters.type = type;
      if (experienceLevel) filters.experienceLevel = experienceLevel;
      if (isRemote !== undefined) filters.isRemote = isRemote === 'true';
      if (location) filters.location = location;
      
      // If search query provided, use search function
      let jobs;
      if (search) {
        jobs = await storage.searchJobs(search as string, filters);
      } else {
        jobs = await storage.getAllJobs(filters);
      }
      
      // Get companies to include in response
      const companies = await storage.getAllCompanies();
      const companiesMap = new Map(companies.map(company => [company.id, company]));
      
      const jobsWithCompany = jobs.map(job => ({
        ...job,
        company: companiesMap.get(job.companyId)
      }));
      
      res.json(jobsWithCompany);
    } catch (error) {
      res.status(500).json({ message: "Error fetching jobs" });
    }
  });
  
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const company = await storage.getCompany(job.companyId);
      
      res.json({
        ...job,
        company
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching job" });
    }
  });
  
  app.post("/api/jobs", hasRole(["employer", "admin"]), async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      
      // Make sure the company belongs to the user
      const company = await storage.getCompany(jobData.companyId);
      if (!company || (req.user.role !== "admin" && company.ownerId !== req.user.id)) {
        return res.status(403).json({ message: "You don't have permission to post jobs for this company" });
      }
      
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating job" });
    }
  });
  
  app.put("/api/jobs/:id", hasRole(["employer", "admin"]), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user owns the company or is admin
      const company = await storage.getCompany(job.companyId);
      if (!company || (req.user.role !== "admin" && company.ownerId !== req.user.id)) {
        return res.status(403).json({ message: "You don't have permission to update this job" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error updating job" });
    }
  });
  
  app.delete("/api/jobs/:id", hasRole(["employer", "admin"]), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user owns the company or is admin
      const company = await storage.getCompany(job.companyId);
      if (!company || (req.user.role !== "admin" && company.ownerId !== req.user.id)) {
        return res.status(403).json({ message: "You don't have permission to delete this job" });
      }
      
      await storage.deleteJob(jobId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting job" });
    }
  });
  
  // Company routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching companies" });
    }
  });
  
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Error fetching company" });
    }
  });
  
  app.post("/api/companies", hasRole(["employer", "admin"]), async (req, res) => {
    try {
      // Override owner ID with current user's ID
      const companyData = insertCompanySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating company" });
    }
  });
  
  app.put("/api/companies/:id", hasRole(["employer", "admin"]), async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Check if user owns the company or is admin
      if (req.user.role !== "admin" && company.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this company" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: "Error updating company" });
    }
  });
  
  // Application routes
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      let applications;
      
      if (req.user.role === "job_seeker") {
        // Job seekers can only see their own applications
        applications = await storage.getApplicationsByUser(req.user.id);
      } else if (req.user.role === "employer") {
        // Employers can see applications for their company's jobs
        const company = await storage.getCompanyByOwnerId(req.user.id);
        
        if (!company) {
          return res.json([]);
        }
        
        // Get all jobs for this company
        const jobs = await storage.getAllJobs({ companyId: company.id });
        const jobIds = jobs.map(job => job.id);
        
        // Get applications for these jobs
        applications = [];
        for (const jobId of jobIds) {
          const jobApplications = await storage.getApplicationsByJob(jobId);
          applications.push(...jobApplications);
        }
      } else if (req.user.role === "admin") {
        // Admins can see all applications
        const allJobs = await storage.getAllJobs();
        applications = [];
        for (const job of allJobs) {
          const jobApplications = await storage.getApplicationsByJob(job.id);
          applications.push(...jobApplications);
        }
      }
      
      // Get related jobs and users
      const jobs = await storage.getAllJobs();
      const users = await storage.getAllUsers();
      const jobsMap = new Map(jobs.map(job => [job.id, job]));
      const usersMap = new Map(users.map(user => [user.id, user]));
      
      const applicationsWithDetails = applications.map(app => ({
        ...app,
        job: jobsMap.get(app.jobId),
        user: usersMap.get(app.userId)
      }));
      
      res.json(applicationsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  app.post("/api/applications", hasRole(["job_seeker"]), async (req, res) => {
    try {
      // Override userId with current user's ID
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if job exists
      const job = await storage.getJob(applicationData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user already applied to this job
      const userApplications = await storage.getApplicationsByUser(req.user.id);
      const alreadyApplied = userApplications.some(app => app.jobId === applicationData.jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating application" });
    }
  });
  
  app.put("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check permissions
      if (req.user.role === "job_seeker" && application.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this application" });
      } else if (req.user.role === "employer") {
        // Employer can only update applications for their jobs
        const job = await storage.getJob(application.jobId);
        const company = await storage.getCompany(job.companyId);
        
        if (!company || company.ownerId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to update this application" });
        }
        
        // Employers can only update the status
        if (Object.keys(req.body).some(key => key !== "status")) {
          return res.status(403).json({ message: "You can only update the application status" });
        }
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, req.body);
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  });
  
  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      
      if (!profile) {
        return res.json({
          userId: req.user.id,
          skills: [],
          education: [],
          experience: [],
          socialLinks: {}
        });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });
  
  app.post("/api/profile", isAuthenticated, async (req, res) => {
    try {
      // Check if profile already exists
      const existingProfile = await storage.getProfile(req.user.id);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists, use PUT to update" });
      }
      
      // Override userId with current user's ID
      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating profile" });
    }
  });
  
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const existingProfile = await storage.getProfile(req.user.id);
      
      if (!existingProfile) {
        // If profile doesn't exist, create it
        const profileData = insertProfileSchema.parse({
          ...req.body,
          userId: req.user.id
        });
        
        const profile = await storage.createProfile(profileData);
        return res.status(201).json(profile);
      }
      
      // Update existing profile
      const updatedProfile = await storage.updateProfile(req.user.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // Saved Jobs routes
  app.get("/api/saved-jobs", hasRole(["job_seeker"]), async (req, res) => {
    try {
      const savedJobs = await storage.getSavedJobsByUser(req.user.id);
      
      // Get job details
      const jobs = await storage.getAllJobs();
      const jobsMap = new Map(jobs.map(job => [job.id, job]));
      
      // Get company details
      const companies = await storage.getAllCompanies();
      const companiesMap = new Map(companies.map(company => [company.id, company]));
      
      const savedJobsWithDetails = savedJobs.map(savedJob => {
        const job = jobsMap.get(savedJob.jobId);
        const company = job ? companiesMap.get(job.companyId) : null;
        
        return {
          ...savedJob,
          job,
          company
        };
      });
      
      res.json(savedJobsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching saved jobs" });
    }
  });
  
  app.post("/api/saved-jobs", hasRole(["job_seeker"]), async (req, res) => {
    try {
      // Override userId with current user's ID
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
      const existingSavedJob = await storage.getSavedJobByUserAndJob(req.user.id, savedJobData.jobId);
      
      if (existingSavedJob) {
        return res.status(400).json({ message: "Job already saved" });
      }
      
      const savedJob = await storage.createSavedJob(savedJobData);
      res.status(201).json(savedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error saving job" });
    }
  });
  
  app.delete("/api/saved-jobs/:id", hasRole(["job_seeker"]), async (req, res) => {
    try {
      const savedJobId = parseInt(req.params.id);
      const savedJob = await storage.getSavedJob(savedJobId);
      
      if (!savedJob) {
        return res.status(404).json({ message: "Saved job not found" });
      }
      
      // Check if belongs to user
      if (savedJob.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this saved job" });
      }
      
      await storage.deleteSavedJob(savedJobId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting saved job" });
    }
  });
  
  // Admin routes for user management
  app.get("/api/admin/users", hasRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  app.put("/api/admin/users/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });
  
  app.delete("/api/admin/users/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
