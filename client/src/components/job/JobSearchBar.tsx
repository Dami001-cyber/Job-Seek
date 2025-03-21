import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface JobSearchBarProps {
  onSearch: (query: SearchQuery) => void;
  className?: string;
  initialValues?: SearchQuery;
}

export interface SearchQuery {
  title: string;
  location: string;
}

export default function JobSearchBar({ onSearch, className = "", initialValues }: JobSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(
    initialValues || { title: "", location: "" }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const popularSearches = ["Remote", "Software Engineer", "Marketing", "Data Analyst"];

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-2 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                name="search" 
                id="search" 
                placeholder="Job title, skills, or company"
                className="pl-10"
                value={searchQuery.title}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                name="location" 
                id="location" 
                placeholder="City or remote"
                className="pl-10"
                value={searchQuery.location}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          
          <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
            Search
          </Button>
        </div>
      </form>
      
      {popularSearches && (
        <div className="mt-4 text-sm">
          <span className="text-gray-200">Popular:</span>
          {popularSearches.map((term, index) => (
            <button
              key={term}
              className="text-white ml-2 hover:underline"
              onClick={() => {
                const newQuery = { ...searchQuery, title: term };
                setSearchQuery(newQuery);
                onSearch(newQuery);
              }}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
