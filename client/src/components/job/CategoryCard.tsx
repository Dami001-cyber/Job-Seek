import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

export default function CategoryCard({
  title,
  description,
  icon,
  color,
  link
}: CategoryCardProps) {
  return (
    <Card className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
      <CardContent className="p-0">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <Link href={link} className="text-primary hover:text-primary/90 font-medium text-sm flex items-center">
          Browse {title} Jobs
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
