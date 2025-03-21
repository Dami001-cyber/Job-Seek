import { FormEvent, useState } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location: string) => void;
  className?: string;
  variant?: "default" | "compact" | "hero";
}

export function SearchBar({ 
  initialQuery = "", 
  initialLocation = "", 
  onSearch, 
  className = "",
  variant = "default"
}: SearchBarProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query, location);
    } else {
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (location) params.append("location", location);
      
      navigate(`/jobs?${params.toString()}`);
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex w-full ${className}`}>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Job title, keywords, or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 py-2 rounded-l-md rounded-r-none border-r-0"
          />
        </div>
        <Button type="submit" className="rounded-l-none">
          Search
        </Button>
      </form>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={`grid grid-cols-1 md:grid-cols-10 gap-4 ${className}`}>
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Job title, keywords, or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="City, state, or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" className="w-full py-6 text-base font-medium">
            Search Jobs
          </Button>
        </div>
      </form>
    );
  }

  // Default search bar
  return (
    <form onSubmit={handleSubmit} className={`flex flex-col md:flex-row gap-3 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Job title, keywords, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 py-5"
        />
      </div>
      <div className="relative flex-grow">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="City, state, or remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 py-5"
        />
      </div>
      <Button type="submit" className="py-5 px-6">
        Search Jobs
      </Button>
    </form>
  );
}
