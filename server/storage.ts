import { users, User, InsertUser, companies, InsertCompany, Company, jobs, Job, InsertJob, jobSeekerProfiles, JobSeekerProfile, InsertJobSeekerProfile, jobApplications, JobApplication, InsertJobApplication, savedJobs, SavedJob, InsertSavedJob, UserRole } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  
  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  getJobsByCompanyId(companyId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<boolean>;
  getAllJobs(filters?: Partial<Job>): Promise<Job[]>;
  
  // Job Seeker Profiles
  getJobSeekerProfile(id: number): Promise<JobSeekerProfile | undefined>;
  getJobSeekerProfileByUserId(userId: number): Promise<JobSeekerProfile | undefined>;
  createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<JobSeekerProfile>;
  updateJobSeekerProfile(id: number, profile: Partial<InsertJobSeekerProfile>): Promise<JobSeekerProfile>;
  
  // Job Applications
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByUserId(userId: number): Promise<JobApplication[]>;
  getJobApplicationsByJobId(jobId: number): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, application: Partial<InsertJobApplication>): Promise<JobApplication>;
  
  // Saved Jobs
  getSavedJob(id: number): Promise<SavedJob | undefined>;
  getSavedJobsByUserId(userId: number): Promise<SavedJob[]>;
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  deleteSavedJob(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private jobs: Map<number, Job>;
  private jobSeekerProfiles: Map<number, JobSeekerProfile>;
  private jobApplications: Map<number, JobApplication>;
  private savedJobs: Map<number, SavedJob>;
  
  userId: number;
  companyId: number;
  jobId: number;
  profileId: number;
  applicationId: number;
  savedJobId: number;
  
  sessionStore: session.SessionStore;
  
  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.jobs = new Map();
    this.jobSeekerProfiles = new Map();
    this.jobApplications = new Map();
    this.savedJobs = new Map();
    
    this.userId = 1;
    this.companyId = 1;
    this.jobId = 1;
    this.profileId = 1;
    this.applicationId = 1;
    this.savedJobId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "adminpassword",
      email: "admin@seekwithdami.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isActive: true };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.userId === userId,
    );
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyId++;
    const company: Company = { ...insertCompany, id };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company> {
    const existingCompany = await this.getCompany(id);
    if (!existingCompany) {
      throw new Error("Company not found");
    }
    
    const updatedCompany = { ...existingCompany, ...companyData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobsByCompanyId(companyId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.companyId === companyId,
    );
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobId++;
    const now = new Date();
    const job: Job = { 
      ...insertJob, 
      id, 
      isActive: true, 
      isApproved: false, 
      createdAt: now 
    };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job> {
    const existingJob = await this.getJob(id);
    if (!existingJob) {
      throw new Error("Job not found");
    }
    
    const updatedJob = { ...existingJob, ...jobData };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }
  
  async getAllJobs(filters?: Partial<Job>): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters) {
      jobs = jobs.filter(job => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'skills' && value) {
            const filterSkills = value as string[];
            return filterSkills.some(skill => job.skills?.includes(skill));
          }
          
          if (value === undefined) {
            return true;
          }
          
          return job[key as keyof Job] === value;
        });
      });
    }
    
    return jobs;
  }
  
  // Job Seeker Profile methods
  async getJobSeekerProfile(id: number): Promise<JobSeekerProfile | undefined> {
    return this.jobSeekerProfiles.get(id);
  }
  
  async getJobSeekerProfileByUserId(userId: number): Promise<JobSeekerProfile | undefined> {
    return Array.from(this.jobSeekerProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createJobSeekerProfile(insertProfile: InsertJobSeekerProfile): Promise<JobSeekerProfile> {
    const id = this.profileId++;
    const profile: JobSeekerProfile = { ...insertProfile, id };
    this.jobSeekerProfiles.set(id, profile);
    return profile;
  }
  
  async updateJobSeekerProfile(id: number, profileData: Partial<InsertJobSeekerProfile>): Promise<JobSeekerProfile> {
    const existingProfile = await this.getJobSeekerProfile(id);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }
    
    const updatedProfile = { ...existingProfile, ...profileData };
    this.jobSeekerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Job Application methods
  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }
  
  async getJobApplicationsByUserId(userId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      (application) => application.userId === userId,
    );
  }
  
  async getJobApplicationsByJobId(jobId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      (application) => application.jobId === jobId,
    );
  }
  
  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const id = this.applicationId++;
    const now = new Date();
    const application: JobApplication = { 
      ...insertApplication, 
      id, 
      status: "pending", 
      createdAt: now 
    };
    this.jobApplications.set(id, application);
    return application;
  }
  
  async updateJobApplication(id: number, applicationData: Partial<InsertJobApplication>): Promise<JobApplication> {
    const existingApplication = await this.getJobApplication(id);
    if (!existingApplication) {
      throw new Error("Job application not found");
    }
    
    const updatedApplication = { ...existingApplication, ...applicationData };
    this.jobApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Saved Jobs methods
  async getSavedJob(id: number): Promise<SavedJob | undefined> {
    return this.savedJobs.get(id);
  }
  
  async getSavedJobsByUserId(userId: number): Promise<SavedJob[]> {
    return Array.from(this.savedJobs.values()).filter(
      (savedJob) => savedJob.userId === userId,
    );
  }
  
  async createSavedJob(insertSavedJob: InsertSavedJob): Promise<SavedJob> {
    const id = this.savedJobId++;
    const now = new Date();
    const savedJob: SavedJob = { ...insertSavedJob, id, createdAt: now };
    this.savedJobs.set(id, savedJob);
    return savedJob;
  }
  
  async deleteSavedJob(id: number): Promise<boolean> {
    return this.savedJobs.delete(id);
  }
}

export const storage = new MemStorage();
