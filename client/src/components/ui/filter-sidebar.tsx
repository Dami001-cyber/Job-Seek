import { CheckCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export interface FilterOptions {
  jobTypes: string[];
  experienceLevels: string[];
  isRemote?: boolean;
  salaryRange?: [number, number];
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
  className?: string;
}

export function FilterSidebar({
  onFilterChange,
  initialFilters = {},
  className = ""
}: FilterSidebarProps) {
  const [jobTypes, setJobTypes] = useState<string[]>(initialFilters.jobTypes || []);
  const [experienceLevels, setExperienceLevels] = useState<string[]>(initialFilters.experienceLevels || []);
  const [isRemote, setIsRemote] = useState<boolean>(initialFilters.isRemote || false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>(initialFilters.salaryRange || [40000, 200000]);
  
  useEffect(() => {
    onFilterChange({
      jobTypes,
      experienceLevels,
      isRemote,
      salaryRange
    });
  }, [jobTypes, experienceLevels, isRemote, salaryRange, onFilterChange]);
  
  const handleJobTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setJobTypes([...jobTypes, type]);
    } else {
      setJobTypes(jobTypes.filter(t => t !== type));
    }
  };
  
  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setExperienceLevels([...experienceLevels, level]);
    } else {
      setExperienceLevels(experienceLevels.filter(l => l !== level));
    }
  };
  
  const clearFilters = () => {
    setJobTypes([]);
    setExperienceLevels([]);
    setIsRemote(false);
    setSalaryRange([40000, 200000]);
  };
  
  const formatSalary = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Filters
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm font-normal">
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Type Filter */}
          <div>
            <h3 className="font-medium mb-3">Job Type</h3>
            <div className="space-y-2">
              {["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`job-type-${type}`} 
                    checked={jobTypes.includes(type)}
                    onCheckedChange={(checked) => handleJobTypeChange(type, checked === true)}
                  />
                  <Label htmlFor={`job-type-${type}`} className="text-sm font-normal cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Experience Level Filter */}
          <div>
            <h3 className="font-medium mb-3">Experience Level</h3>
            <div className="space-y-2">
              {["Entry", "Mid", "Senior", "Executive"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`experience-${level}`} 
                    checked={experienceLevels.includes(level)}
                    onCheckedChange={(checked) => handleExperienceLevelChange(level, checked === true)}
                  />
                  <Label htmlFor={`experience-${level}`} className="text-sm font-normal cursor-pointer">
                    {level} Level
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Remote Filter */}
          <div>
            <h3 className="font-medium mb-3">Remote Options</h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remote-job" 
                checked={isRemote}
                onCheckedChange={(checked) => setIsRemote(checked === true)}
              />
              <Label htmlFor="remote-job" className="text-sm font-normal cursor-pointer">
                Remote Jobs Only
              </Label>
            </div>
          </div>
          
          {/* Salary Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Salary Range</h3>
              <span className="text-sm text-gray-500">
                {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
              </span>
            </div>
            <Slider
              defaultValue={salaryRange}
              min={0}
              max={300000}
              step={10000}
              value={salaryRange}
              onValueChange={(value) => setSalaryRange(value as [number, number])}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$300K+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
