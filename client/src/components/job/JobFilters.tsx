import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  jobType: string[];
  minSalary: number;
  isRemote: boolean;
  skills: string[];
  experience: string;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
const SKILLS = ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "AWS", "DevOps", "UI/UX", "Product Management", "Marketing", "Sales"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Manager", "Director", "Executive"];

export default function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    jobType: [],
    minSalary: 0,
    isRemote: false,
    skills: [],
    experience: "",
  });

  const handleJobTypeChange = (checked: boolean | "indeterminate", jobType: string) => {
    if (checked === "indeterminate") return;
    
    setFilterState(prev => {
      const updatedJobTypes = checked 
        ? [...prev.jobType, jobType]
        : prev.jobType.filter(type => type !== jobType);
        
      const newState = { ...prev, jobType: updatedJobTypes };
      onFilterChange(newState);
      return newState;
    });
  };

  const handleSkillChange = (checked: boolean | "indeterminate", skill: string) => {
    if (checked === "indeterminate") return;
    
    setFilterState(prev => {
      const updatedSkills = checked 
        ? [...prev.skills, skill]
        : prev.skills.filter(s => s !== skill);
        
      const newState = { ...prev, skills: updatedSkills };
      onFilterChange(newState);
      return newState;
    });
  };

  const handleRemoteChange = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    
    setFilterState(prev => {
      const newState = { ...prev, isRemote: checked };
      onFilterChange(newState);
      return newState;
    });
  };

  const handleSalaryChange = (value: number[]) => {
    setFilterState(prev => {
      const newState = { ...prev, minSalary: value[0] };
      onFilterChange(newState);
      return newState;
    });
  };

  const handleExperienceChange = (value: string) => {
    setFilterState(prev => {
      const newState = { ...prev, experience: value };
      onFilterChange(newState);
      return newState;
    });
  };

  const clearFilters = () => {
    const resetState: FilterState = {
      jobType: [],
      minSalary: 0,
      isRemote: false,
      skills: [],
      experience: "",
    };
    setFilterState(resetState);
    onFilterChange(resetState);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" onClick={clearFilters} size="sm">
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["job-type", "job-location", "salary"]} className="space-y-4">
        <AccordionItem value="job-type">
          <AccordionTrigger className="text-base font-medium py-2">
            Job Type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {JOB_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`job-type-${type}`} 
                    checked={filterState.jobType.includes(type)}
                    onCheckedChange={(checked) => handleJobTypeChange(checked, type)}
                  />
                  <Label htmlFor={`job-type-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-location">
          <AccordionTrigger className="text-base font-medium py-2">
            Location
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="remote-only" 
                checked={filterState.isRemote}
                onCheckedChange={handleRemoteChange}
              />
              <Label htmlFor="remote-only">Remote only</Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="salary">
          <AccordionTrigger className="text-base font-medium py-2">
            Salary
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 px-1">
              <div className="mb-6">
                <Slider 
                  defaultValue={[0]} 
                  max={200000} 
                  step={10000}
                  value={[filterState.minSalary]}
                  onValueChange={handleSalaryChange}
                />
              </div>
              <div className="text-sm text-gray-500">
                Minimum salary: ${filterState.minSalary.toLocaleString()}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="text-base font-medium py-2">
            Experience Level
          </AccordionTrigger>
          <AccordionContent>
            <Select value={filterState.experience} onValueChange={handleExperienceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Experience Level</SelectLabel>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills">
          <AccordionTrigger className="text-base font-medium py-2">
            Skills
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
              {SKILLS.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`skill-${skill}`} 
                    checked={filterState.skills.includes(skill)}
                    onCheckedChange={(checked) => handleSkillChange(checked, skill)}
                  />
                  <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
