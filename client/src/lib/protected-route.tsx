import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { UserRole } from "@shared/schema";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  requiredRole?: UserRole[];
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={`/auth?redirect=${encodeURIComponent(location)}`} />
      </Route>
    );
  }

  if (requiredRole && !requiredRole.includes(user.role as UserRole)) {
    // Redirect to the appropriate dashboard based on role
    let redirectPath = "/";
    if (user.role === UserRole.JOB_SEEKER) {
      redirectPath = "/dashboard/job-seeker";
    } else if (user.role === UserRole.EMPLOYER) {
      redirectPath = "/dashboard/employer";
    } else if (user.role === UserRole.ADMIN) {
      redirectPath = "/dashboard/admin";
    }

    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
