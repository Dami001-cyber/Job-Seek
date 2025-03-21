import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company } from "@shared/schema";
import { Building2, Globe, MapPin, Users } from "lucide-react";
import { useLocation } from "wouter";

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
}

export function CompanyCard({ company, jobCount }: CompanyCardProps) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-16 w-16 object-contain rounded"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
              {company.industry && (
                <p className="text-gray-500">{company.industry}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {company.location && (
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>{company.location}</span>
            </div>
          )}
          {company.size && (
            <div className="flex items-center text-gray-500 text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>{company.size}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center text-gray-500 text-sm">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            </div>
          )}
          {jobCount !== undefined && (
            <div className="flex items-center text-gray-500 text-sm">
              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
              <span>{jobCount} {jobCount === 1 ? 'job' : 'jobs'}</span>
            </div>
          )}
        </div>
        
        {company.description && (
          <p className="text-gray-500 mt-4 text-sm line-clamp-2">
            {company.description}
          </p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            className="text-primary border-primary hover:bg-primary/5"
            onClick={() => navigate(`/companies/${company.id}`)}
          >
            View Company
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
