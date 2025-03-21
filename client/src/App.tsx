import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import JobsPage from "@/pages/jobs-page";
import JobDetailsPage from "@/pages/job-details-page";
import SeekerDashboard from "@/pages/dashboard/seeker-dashboard";
import EmployerDashboard from "@/pages/dashboard/employer-dashboard";
import AdminDashboard from "@/pages/dashboard/admin-dashboard";
import ProfilePage from "@/pages/dashboard/profile-page";
import ApplicationsPage from "@/pages/dashboard/applications-page";
import SavedJobsPage from "@/pages/dashboard/saved-jobs-page";
import PostJobPage from "@/pages/dashboard/post-job-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/jobs/:id" component={JobDetailsPage} />
      
      {/* Dashboard routes */}
      <ProtectedRoute path="/dashboard/seeker" roles={["job_seeker"]} component={SeekerDashboard} />
      <ProtectedRoute path="/dashboard/employer" roles={["employer"]} component={EmployerDashboard} />
      <ProtectedRoute path="/dashboard/admin" roles={["admin"]} component={AdminDashboard} />
      
      {/* Common dashboard routes */}
      <ProtectedRoute path="/dashboard/profile" component={ProfilePage} />
      <ProtectedRoute path="/dashboard/applications" component={ApplicationsPage} />
      <ProtectedRoute path="/dashboard/saved-jobs" roles={["job_seeker"]} component={SavedJobsPage} />
      <ProtectedRoute path="/dashboard/post-job" roles={["employer", "admin"]} component={PostJobPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
