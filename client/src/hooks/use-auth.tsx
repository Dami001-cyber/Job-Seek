import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Remove sensitive fields from User type
type SafeUser = Omit<User, "password">;

type AuthContextType = {
  user: SafeUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SafeUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SafeUser, Error, RegisterData>;
  redirectToDashboard: () => string;
};

// Form validation schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SafeUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    initialData: null
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: SafeUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.firstName}!`,
      });
      
      // Redirect to the appropriate dashboard based on user role
      let dashboardPath = "/";
      switch (userData.role) {
        case "job_seeker":
          dashboardPath = "/dashboard/seeker";
          break;
        case "employer":
          dashboardPath = "/dashboard/employer";
          break;
        case "admin":
          dashboardPath = "/dashboard/admin";
          break;
      }
      
      // Use setTimeout to ensure the redirection happens after the state update
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...credentials } = data;
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (userData: SafeUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to Seek with Dami, ${userData.firstName}!`,
      });
      
      // Redirect to the appropriate dashboard based on user role
      let dashboardPath = "/";
      switch (userData.role) {
        case "job_seeker":
          dashboardPath = "/dashboard/seeker";
          break;
        case "employer":
          dashboardPath = "/dashboard/employer";
          break;
        case "admin":
          dashboardPath = "/dashboard/admin";
          break;
      }
      
      // Use setTimeout to ensure the redirection happens after the state update
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
      
      // Redirect to the login page
      setTimeout(() => {
        window.location.href = "/auth";
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const redirectToDashboard = () => {
    if (!user) return "/auth";
    
    switch (user.role) {
      case "job_seeker":
        return "/dashboard/seeker";
      case "employer":
        return "/dashboard/employer";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        redirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
