import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import JobSearchPage from "@/pages/job-search-page";
import JobDetailsPage from "@/pages/job-details-page";
import JobSeekerDashboard from "@/pages/job-seeker-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/jobs" component={JobSearchPage} />
      <ProtectedRoute path="/jobs/:id" component={JobDetailsPage} />
      <ProtectedRoute path="/dashboard/job-seeker" component={JobSeekerDashboard} />
      <ProtectedRoute path="/dashboard/employer" component={EmployerDashboard} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
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
