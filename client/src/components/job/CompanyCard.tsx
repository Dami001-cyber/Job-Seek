import { Card, CardContent } from "@/components/ui/card";
import { Company } from "@shared/schema";

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export default function CompanyCard({ company, className = "" }: CompanyCardProps) {
  // Generate company initials if no logo is available
  const companyInitials = company.name 
    ? company.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
    : "CO";

  return (
    <Card className={`bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-24 ${className}`}>
      {company.logo ? (
        <img 
          src={company.logo} 
          alt={company.name} 
          className="h-12 max-w-full object-contain"
        />
      ) : (
        <span className="text-2xl font-bold text-gray-400">{companyInitials}</span>
      )}
    </Card>
  );
}
