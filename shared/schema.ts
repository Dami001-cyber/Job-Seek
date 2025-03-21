import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  JOB_SEEKER = "job_seeker",
  EMPLOYER = "employer",
  ADMIN = "admin"
}

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.JOB_SEEKER),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
});

// Job seeker profile schema
export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  bio: text("bio"),
  resume: text("resume"),
  skills: text("skills").array(),
  experience: jsonb("experience"),
  education: jsonb("education"),
  location: text("location"),
});

export const insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).pick({
  userId: true,
  title: true,
  bio: true,
  resume: true,
  skills: true,
  experience: true,
  education: true,
  location: true,
});

// Company schema
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  industry: text("industry"),
  location: text("location"),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  userId: true,
  name: true,
  description: true,
  logo: true,
  website: true,
  industry: true,
  location: true,
});

// Job schema
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  type: text("type").notNull(), // Full-time, Part-time, Contract, etc.
  skills: text("skills").array(),
  isRemote: boolean("is_remote").default(false),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  companyId: true,
  title: true,
  description: true,
  location: true,
  salary: true,
  type: true,
  skills: true,
  isRemote: true,
});

// Job application schema
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  status: text("status").default("pending"), // pending, reviewed, rejected, accepted
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  jobId: true,
  userId: true,
  resume: true,
  coverLetter: true,
});

// Saved jobs schema
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).pick({
  jobId: true,
  userId: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJobSeekerProfile = z.infer<typeof insertJobSeekerProfileSchema>;
export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
