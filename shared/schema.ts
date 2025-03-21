import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['job_seeker', 'employer', 'admin']);
export const jobTypeEnum = pgEnum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'remote']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'reviewing', 'interview', 'rejected', 'accepted']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").notNull().default('job_seeker'),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Seeker Profile Table
export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  bio: text("bio"),
  resumeUrl: text("resume_url"),
  skills: text("skills").array(),
  experience: integer("experience"),
  education: text("education"),
  location: text("location"),
});

// Employer Profile Table
export const employerProfiles = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  companyLogo: text("company_logo"),
  industry: text("industry"),
  companySize: text("company_size"),
  companyDescription: text("company_description"),
  website: text("website"),
  location: text("location"),
});

// Jobs Table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  location: text("location").notNull(),
  salary: text("salary"),
  type: jobTypeEnum("type").notNull(),
  requirements: text("requirements"),
  isRemote: boolean("is_remote").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  approved: boolean("approved").default(false),
});

// Applications Table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  jobSeekerId: integer("job_seeker_id").notNull().references(() => users.id),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").default('pending'),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved Jobs Table
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).omit({
  id: true,
});

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles).omit({
  id: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  approved: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
  status: true,
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
  savedAt: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type InsertJobSeekerProfile = z.infer<typeof insertJobSeekerProfileSchema>;

export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
