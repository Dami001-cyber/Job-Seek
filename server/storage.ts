import { 
  users, type User, type InsertUser,
  jobs, type Job, type InsertJob,
  companies, type Company, type InsertCompany,
  applications, type Application, type InsertApplication,
  profiles, type Profile, type InsertProfile,
  savedJobs, type SavedJob, type InsertSavedJob
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  getAllJobs(filters?: Partial<Job>): Promise<Job[]>;
  searchJobs(query: string, filters?: Partial<Job>): Promise<Job[]>;
  
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<Company>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  getAllCompanies(): Promise<Company[]>;
  getCompanyByOwnerId(ownerId: number): Promise<Company | undefined>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  
  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  // Saved jobs methods
  getSavedJob(id: number): Promise<SavedJob | undefined>;
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  deleteSavedJob(id: number): Promise<boolean>;
  getSavedJobsByUser(userId: number): Promise<SavedJob[]>;
  getSavedJobByUserAndJob(userId: number, jobId: number): Promise<SavedJob | undefined>;
  
  // Session store for auth
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private companies: Map<number, Company>;
  private applications: Map<number, Application>;
  private profiles: Map<number, Profile>;
  private savedJobs: Map<number, SavedJob>;
  
  userCurrentId: number;
  jobCurrentId: number;
  companyCurrentId: number;
  applicationCurrentId: number;
  profileCurrentId: number;
  savedJobCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.companies = new Map();
    this.applications = new Map();
    this.profiles = new Map();
    this.savedJobs = new Map();
    
    this.userCurrentId = 1;
    this.jobCurrentId = 1;
    this.companyCurrentId = 1;
    this.applicationCurrentId = 1;
    this.profileCurrentId = 1;
    this.savedJobCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const job: Job = { ...insertJob, id, createdAt, updatedAt };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = await this.getJob(id);
    if (!job) return undefined;
    
    const updatedAt = new Date();
    const updatedJob = { ...job, ...jobData, updatedAt };
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
        for (const [key, value] of Object.entries(filters)) {
          if (job[key as keyof Job] !== value) return false;
        }
        return true;
      });
    }
    
    return jobs;
  }
  
  async searchJobs(query: string, filters?: Partial<Job>): Promise<Job[]> {
    query = query.toLowerCase();
    let jobs = Array.from(this.jobs.values());
    
    // Filter by search query
    jobs = jobs.filter(job => {
      return job.title.toLowerCase().includes(query) || 
             job.description.toLowerCase().includes(query) ||
             job.location.toLowerCase().includes(query);
    });
    
    // Apply additional filters
    if (filters) {
      jobs = jobs.filter(job => {
        for (const [key, value] of Object.entries(filters)) {
          if (job[key as keyof Job] !== value) return false;
        }
        return true;
      });
    }
    
    return jobs;
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyCurrentId++;
    const createdAt = new Date();
    const company: Company = { ...insertCompany, id, createdAt };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, companyData: Partial<Company>): Promise<Company | undefined> {
    const company = await this.getCompany(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...companyData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }
  
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  async getCompanyByOwnerId(ownerId: number): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.ownerId === ownerId,
    );
  }
  
  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const application: Application = { ...insertApplication, id, createdAt, updatedAt };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;
    
    const updatedAt = new Date();
    const updatedApplication = { ...application, ...applicationData, updatedAt };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }
  
  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.userId === userId,
    );
  }
  
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.jobId === jobId,
    );
  }
  
  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.profileCurrentId++;
    const updatedAt = new Date();
    const profile: Profile = { ...insertProfile, id, updatedAt };
    this.profiles.set(id, profile);
    return profile;
  }
  
  async updateProfile(userId: number, profileData: Partial<Profile>): Promise<Profile | undefined> {
    const profile = await this.getProfile(userId);
    if (!profile) return undefined;
    
    const updatedAt = new Date();
    const updatedProfile = { ...profile, ...profileData, updatedAt };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Saved jobs methods
  async getSavedJob(id: number): Promise<SavedJob | undefined> {
    return this.savedJobs.get(id);
  }
  
  async createSavedJob(insertSavedJob: InsertSavedJob): Promise<SavedJob> {
    const id = this.savedJobCurrentId++;
    const createdAt = new Date();
    const savedJob: SavedJob = { ...insertSavedJob, id, createdAt };
    this.savedJobs.set(id, savedJob);
    return savedJob;
  }
  
  async deleteSavedJob(id: number): Promise<boolean> {
    return this.savedJobs.delete(id);
  }
  
  async getSavedJobsByUser(userId: number): Promise<SavedJob[]> {
    return Array.from(this.savedJobs.values()).filter(
      (savedJob) => savedJob.userId === userId,
    );
  }
  
  async getSavedJobByUserAndJob(userId: number, jobId: number): Promise<SavedJob | undefined> {
    return Array.from(this.savedJobs.values()).find(
      (savedJob) => savedJob.userId === userId && savedJob.jobId === jobId,
    );
  }
}

export const storage = new MemStorage();
