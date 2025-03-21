import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("job_seeker"), // job_seeker, employer, admin
  email: text("email").notNull().unique(),
  phone: text("phone"),
  location: text("location"),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  email: true,
  phone: true,
  location: true,
});

// Job model
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // full-time, part-time, contract, etc.
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  isRemote: boolean("is_remote").default(false),
  experienceLevel: text("experience_level"), // entry, mid, senior
  status: text("status").notNull().default("active"), // active, closed, draft
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  companyId: true,
  description: true,
  location: true,
  type: true,
  salaryMin: true,
  salaryMax: true,
  isRemote: true,
  experienceLevel: true,
  status: true,
});

// Company model
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  location: text("location"),
  size: text("size"), // small, medium, large
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow(),
  ownerId: integer("owner_id").notNull(), // Reference to user id
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  description: true,
  website: true,
  logo: true,
  location: true,
  size: true,
  industry: true,
  ownerId: true,
});

// Application model
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  userId: integer("user_id").notNull(),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"), // pending, reviewed, interview, rejected, accepted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  userId: true,
  resumeUrl: true,
  coverLetter: true,
  status: true,
});

// User profile model
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  skills: json("skills").notNull().default([]),
  education: json("education").notNull().default([]),
  experience: json("experience").notNull().default([]),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  socialLinks: json("social_links").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
  skills: true,
  education: true,
  experience: true,
  resumeUrl: true,
  portfolioUrl: true,
  socialLinks: true,
});

// Saved jobs model
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).pick({
  userId: true,
  jobId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
