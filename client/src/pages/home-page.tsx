import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobSearchBar, { SearchQuery } from "@/components/job/JobSearchBar";
import JobCard from "@/components/job/JobCard";
import CompanyCard from "@/components/job/CompanyCard";
import CategoryCard from "@/components/job/CategoryCard";
import HowItWorksSection from "@/components/common/HowItWorksSection";
import TestimonialsSection from "@/components/common/TestimonialsSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Job } from "@shared/schema";
import { Laptop, ChartLine, Briefcase, PaintBrush } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Featured jobs query
  const { data: featuredJobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?limit=3`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch featured jobs");
      }
      return res.json();
    },
  });

  // Handle search
  const handleSearch = (query: SearchQuery) => {
    const searchParams = new URLSearchParams();
    if (query.title) searchParams.append("title", query.title);
    if (query.location) searchParams.append("location", query.location);
    
    navigate(`/jobs?${searchParams.toString()}`);
  };

  // Category data
  const jobCategories = [
    {
      title: "Technology",
      description: "Software engineers, data scientists, product managers and more.",
      icon: <Laptop className="text-primary text-xl" />,
      color: "bg-primary-100",
      link: "/jobs?category=technology"
    },
    {
      title: "Marketing",
      description: "Digital marketers, content creators, SEO specialists and more.",
      icon: <ChartLine className="text-blue-600 text-xl" />,
      color: "bg-blue-100",
      link: "/jobs?category=marketing"
    },
    {
      title: "Business",
      description: "Project managers, business analysts, operations roles and more.",
      icon: <Briefcase className="text-green-600 text-xl" />,
      color: "bg-green-100",
      link: "/jobs?category=business"
    },
    {
      title: "Design",
      description: "UX/UI designers, graphic designers, product designers and more.",
      icon: <PaintBrush className="text-purple-600 text-xl" />,
      color: "bg-purple-100",
      link: "/jobs?category=design"
    }
  ];

  // Mock companies for the initial showcase
  const topCompanies = [
    { id: 1, name: "AlphaBeta Tech", logo: "", website: "", description: "", industry: "Technology", location: "San Francisco", userId: 1 },
    { id: 2, name: "Strive Cloud", logo: "", website: "", description: "", industry: "Cloud Services", location: "New York", userId: 2 },
    { id: 3, name: "VisionTech", logo: "", website: "", description: "", industry: "Design", location: "Seattle", userId: 3 },
    { id: 4, name: "Nexus Group", logo: "", website: "", description: "", industry: "Consulting", location: "Boston", userId: 4 },
    { id: 5, name: "Horizon Studios", logo: "", website: "", description: "", industry: "Media", location: "Los Angeles", userId: 5 },
    { id: 6, name: "Quantum Innovations", logo: "", website: "", description: "", industry: "R&D", location: "Austin", userId: 6 }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job Today</h1>
              <p className="text-lg mb-8 text-primary-100">Search through thousands of job listings and discover opportunities that match your skills and career goals.</p>
              
              {/* Search Form */}
              <JobSearchBar onSearch={handleSearch} className="mb-4" />
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Job seekers collaborating" 
                className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <Link href="/jobs" className="text-primary hover:text-primary/90 font-medium flex items-center">
              View all jobs 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/5 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : featuredJobs && featuredJobs.length > 0 ? (
              featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              // Empty state
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No featured jobs available at the moment.</p>
                <Button asChild className="mt-4">
                  <Link href="/jobs">Browse All Jobs</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Companies Hiring Now</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {topCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore Jobs by Category</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <CategoryCard
                key={index}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                link={category.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who have found their dream jobs through Seek with Dami. It's free and takes less than 5 minutes to get started.
          </p>
          <div className="space-x-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth?tab=register">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-primary-700" size="lg">
              <Link href="/jobs">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
