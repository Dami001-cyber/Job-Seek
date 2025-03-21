import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobSearchBar, { SearchQuery } from "@/components/job/JobSearchBar";
import JobFilters, { FilterState } from "@/components/job/JobFilters";
import JobCard from "@/components/job/JobCard";
import { Job, Company } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function JobSearchPage() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(location.split("?")[1])
  );
  
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    title: searchParams.get("title") || "",
    location: searchParams.get("location") || "",
  });
  
  const [filters, setFilters] = useState<FilterState>({
    jobType: (searchParams.get("jobType")?.split(",") || []) as string[],
    minSalary: parseInt(searchParams.get("minSalary") || "0"),
    isRemote: searchParams.get("isRemote") === "true",
    skills: (searchParams.get("skills")?.split(",") || []) as string[],
    experience: searchParams.get("experience") || "",
  });

  // Fetch jobs with current filters
  const {
    data: jobs,
    isLoading,
    isError,
    error,
  } = useQuery<Job[]>({
    queryKey: ["/api/jobs", searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchQuery.title) params.append("title", searchQuery.title);
      if (searchQuery.location) params.append("location", searchQuery.location);
      
      if (filters.jobType.length > 0) params.append("type", filters.jobType.join(","));
      if (filters.minSalary > 0) params.append("minSalary", filters.minSalary.toString());
      if (filters.isRemote) params.append("isRemote", "true");
      if (filters.skills.length > 0) params.append("skills", filters.skills.join(","));
      if (filters.experience) params.append("experience", filters.experience);
      
      const res = await fetch(`/api/jobs?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      return res.json();
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery.title) params.append("title", searchQuery.title);
    if (searchQuery.location) params.append("location", searchQuery.location);
    
    if (filters.jobType.length > 0) params.append("jobType", filters.jobType.join(","));
    if (filters.minSalary > 0) params.append("minSalary", filters.minSalary.toString());
    if (filters.isRemote) params.append("isRemote", "true");
    if (filters.skills.length > 0) params.append("skills", filters.skills.join(","));
    if (filters.experience) params.append("experience", filters.experience);
    
    setSearchParams(params);
    setLocation(`/jobs?${params.toString()}`, { replace: true });
  }, [searchQuery, filters, setLocation]);

  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        {/* Search Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-500 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Find Your Perfect Job</h1>
            <JobSearchBar onSearch={handleSearch} initialValues={searchQuery} />
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <aside className="lg:col-span-1">
              <JobFilters onFilterChange={handleFilterChange} />
            </aside>
            
            {/* Job Listings */}
            <div className="lg:col-span-3">
              {/* Search Results Summary */}
              <div className="mb-6 flex flex-wrap items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading
                    ? "Searching for jobs..."
                    : isError
                    ? "Error loading jobs"
                    : jobs && jobs.length > 0
                    ? `${jobs.length} jobs found`
                    : "No jobs found"}
                </h2>
                
                <div className="flex items-center text-sm text-gray-500 mt-2 sm:mt-0">
                  <span>Sort by:</span>
                  <select className="ml-2 p-1 border rounded">
                    <option>Most Relevant</option>
                    <option>Newest</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                </div>
              </div>
              
              {/* Job Cards */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">
                      {error instanceof Error ? error.message : "An error occurred"}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-gray-500">
                      Try adjusting your search filters or try a different search term.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => {
                        setSearchQuery({ title: "", location: "" });
                        setFilters({
                          jobType: [],
                          minSalary: 0,
                          isRemote: false,
                          skills: [],
                          experience: "",
                        });
                      }}>
                        Clear all filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
