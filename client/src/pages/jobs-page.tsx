import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { SearchBar } from "@/components/ui/search-bar";
import { JobCard } from "@/components/ui/job-card";
import { FilterSidebar, FilterOptions } from "@/components/ui/filter-sidebar";
import { Job, Company, SavedJob } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function JobsPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Get search parameters from URL
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "";
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [filters, setFilters] = useState<FilterOptions>({
    jobTypes: [],
    experienceLevels: [],
    isRemote: false,
    salaryRange: [0, 300000]
  });
  
  // Fetch jobs with filters
  const { data: jobs, isLoading, error } = useQuery<(Job & { company?: Company | null })[]>({
    queryKey: ["/api/jobs", searchQuery, locationQuery, filters],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (locationQuery) params.append("location", locationQuery);
      
      // Add filters
      if (filters.jobTypes.length > 0) {
        filters.jobTypes.forEach(type => params.append("type", type));
      }
      if (filters.experienceLevels.length > 0) {
        filters.experienceLevels.forEach(level => params.append("experienceLevel", level));
      }
      if (filters.isRemote) params.append("isRemote", "true");
      if (filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 300000)) {
        params.append("salaryMin", filters.salaryRange[0].toString());
        params.append("salaryMax", filters.salaryRange[1].toString());
      }
      
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });
  
  // Fetch saved jobs if user is logged in
  const { data: savedJobs } = useQuery<(SavedJob & { job?: Job, company?: Company })[]>({
    queryKey: ["/api/saved-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/saved-jobs");
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      return res.json();
    },
    enabled: !!user && user.role === "job_seeker",
  });
  
  // Handle search
  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocationQuery(location);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  // Check if a job is saved
  const checkIfJobSaved = (jobId: number) => {
    if (!savedJobs) return { isSaved: false };
    const savedJob = savedJobs.find(sj => sj.jobId === jobId);
    return { isSaved: !!savedJob, savedJobId: savedJob?.id };
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Perfect Job</h1>
            <SearchBar 
              initialQuery={searchQuery} 
              initialLocation={locationQuery} 
              onSearch={handleSearch}
              className="bg-white p-6 rounded-lg shadow-sm"
            />
          </div>
          
          {/* Content area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <FilterSidebar 
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>
            
            {/* Main content */}
            <div className="w-full lg:w-3/4">
              {/* Results header */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Searching for jobs...
                    </span>
                  ) : jobs ? (
                    `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`
                  ) : 'No jobs found'}
                </h2>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border rounded-md px-2 py-1">
                    <option>Most relevant</option>
                    <option>Date: newest first</option>
                    <option>Salary: high to low</option>
                    <option>Salary: low to high</option>
                  </select>
                </div>
              </div>
              
              {/* Job listings */}
              <div className="space-y-6">
                {isLoading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="ml-4">
                            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                    <p className="text-red-600 mb-4">Error loading jobs. Please try again.</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  jobs.map((job) => {
                    const { isSaved, savedJobId } = checkIfJobSaved(job.id);
                    return (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        isSaved={isSaved}
                        savedJobId={savedJobId}
                      />
                    );
                  })
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                    <Button onClick={() => {
                      setSearchQuery("");
                      setLocationQuery("");
                      setFilters({
                        jobTypes: [],
                        experienceLevels: [],
                        isRemote: false,
                        salaryRange: [0, 300000]
                      });
                    }}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Pagination (if needed) */}
              {jobs && jobs.length > 10 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <span className="px-2">...</span>
                    <Button variant="outline" size="sm">10</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
