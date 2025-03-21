import { MainLayout } from "@/components/layouts/main-layout";
import { SearchBar } from "@/components/ui/search-bar";
import { JobCard } from "@/components/ui/job-card";
import { CompanyCard } from "@/components/ui/company-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Job, Company } from "@shared/schema";
import { CheckCircle, ExternalLink, ArrowRight, Users, Search, Bookmark, Send } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch featured jobs
  const { data: featuredJobs, isLoading: isLoadingJobs } = useQuery<(Job & { company?: Company | null })[]>({
    queryKey: ["/api/jobs", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/jobs?featured=true&limit=3");
      return res.json();
    },
  });

  // Fetch top companies
  const { data: topCompanies, isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies", "top"],
    queryFn: async () => {
      const res = await fetch("/api/companies?top=true&limit=6");
      return res.json();
    },
  });

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">
          <div className="lg:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-heading mb-6">
              Find the perfect job <span className="text-primary">that matches your skills</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Connect with thousands of employers and discover opportunities that align with your career goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="py-6 px-8 text-lg" onClick={() => navigate("/jobs")}>
                Find Jobs
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="py-6 px-8 text-lg border-primary text-primary"
                onClick={() => navigate("/auth?tab=register&role=employer")}
              >
                Post a Job
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
              <span className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> 10,000+ Jobs</span>
              <span className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Verified Employers</span>
              <span className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Free Sign-up</span>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1500&q=80" 
              alt="Professional job seekers collaborating" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8 shadow-md -mt-6 relative z-10 mx-auto max-w-6xl rounded-xl">
        <SearchBar variant="hero" />
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Featured Jobs</h2>
          <Link href="/jobs" className="text-primary hover:text-primary/90 font-medium flex items-center">
            View all jobs <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingJobs ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="ml-4">
                      <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : featuredJobs && featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No featured jobs available at the moment.</p>
              <Button onClick={() => navigate("/jobs")} className="mt-4">
                Browse All Jobs
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-4">Top Companies Hiring</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with industry leaders and find opportunities with established companies that are actively looking for talent.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoadingCompanies ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center animate-pulse">
                <div className="h-12 w-full bg-gray-200 rounded"></div>
              </div>
            ))
          ) : topCompanies && topCompanies.length > 0 ? (
            topCompanies.map((company) => (
              <div key={company.id} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="max-h-12" />
                ) : (
                  <div className="h-12 w-full bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    {company.name}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-6 text-center py-10">
              <p className="text-gray-500">No companies available at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/companies" className="text-primary hover:text-primary/90 font-medium inline-flex items-center">
            View all companies <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-4">Browse Jobs by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore opportunities across different industries and find your perfect career match.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link href="/jobs?category=technology">
            <a className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:border-primary border border-gray-200 transition-all group">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-50 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Technology</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Software development, IT support, data analysis, and more</p>
              <span className="text-sm text-primary">842 open positions</span>
            </a>
          </Link>
          
          <Link href="/jobs?category=business">
            <a className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:border-primary border border-gray-200 transition-all group">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-green-50 text-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Business</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Marketing, sales, accounting, and management</p>
              <span className="text-sm text-primary">614 open positions</span>
            </a>
          </Link>
          
          <Link href="/jobs?category=design">
            <a className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:border-primary border border-gray-200 transition-all group">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" y1="8" x2="12" y2="8"></line>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Design</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">UX/UI design, graphic design, product design</p>
              <span className="text-sm text-primary">317 open positions</span>
            </a>
          </Link>
          
          <Link href="/jobs?category=education">
            <a className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:border-primary border border-gray-200 transition-all group">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Education</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Teaching, training, curriculum development</p>
              <span className="text-sm text-primary">253 open positions</span>
            </a>
          </Link>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/jobs" className="text-primary hover:text-primary/90 font-medium inline-flex items-center">
            View all categories <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to find and apply for jobs that match your skills and interests.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Create an Account</h3>
            <p className="text-gray-600">
              Sign up and build your professional profile to showcase your skills and experience to employers.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Find the Right Job</h3>
            <p className="text-gray-600">
              Search and filter through thousands of opportunities to find the perfect match for your career goals.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6">
              <Send className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Apply with Ease</h3>
            <p className="text-gray-600">
              Submit your application with just a few clicks and track your application status in real-time.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Button size="lg" onClick={() => navigate("/auth?tab=register")}>
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-4">Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from job seekers who found their dream careers on our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-6 text-yellow-400">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-gray-600 text-sm">5.0</span>
            </div>
            <p className="text-gray-600 mb-6">
              "I found my dream job as a UX Designer within just two weeks of using this platform. The search filters helped me find exactly what I was looking for."
            </p>
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80" alt="Sarah Johnson" className="h-12 w-12 rounded-full object-cover" />
              <div className="ml-4">
                <h4 className="text-gray-900 font-medium">Sarah Johnson</h4>
                <p className="text-gray-600 text-sm">UX Designer at Adobe</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-6 text-yellow-400">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-gray-600 text-sm">5.0</span>
            </div>
            <p className="text-gray-600 mb-6">
              "As a recent graduate, I was worried about finding my first job. This platform connected me with several entry-level positions that matched my skills perfectly."
            </p>
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80" alt="David Chen" className="h-12 w-12 rounded-full object-cover" />
              <div className="ml-4">
                <h4 className="text-gray-900 font-medium">David Chen</h4>
                <p className="text-gray-600 text-sm">Software Engineer at Spotify</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {Array(4).fill(0).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className="text-gray-300" />
                </svg>
              </div>
              <span className="ml-2 text-gray-600 text-sm">4.5</span>
            </div>
            <p className="text-gray-600 mb-6">
              "The platform's interface is so intuitive. I could easily filter jobs by location, salary, and experience level to find positions that fit my career goals."
            </p>
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80" alt="Michelle Rodriguez" className="h-12 w-12 rounded-full object-cover" />
              <div className="ml-4">
                <h4 className="text-gray-900 font-medium">Michelle Rodriguez</h4>
                <p className="text-gray-600 text-sm">Marketing Manager at Twitter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-primary rounded-2xl py-12 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8">
            <h2 className="text-3xl font-bold text-white font-heading mb-4">Ready to find your dream job?</h2>
            <p className="text-blue-100 max-w-md">
              Join thousands of job seekers who have found their perfect career match on our platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white hover:bg-gray-50 text-primary"
              onClick={() => navigate("/auth?tab=register")}
            >
              Create Account
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent hover:bg-blue-600 text-white border-white"
              onClick={() => navigate("/jobs")}
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
