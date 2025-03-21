import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActivePath = (path: string) => {
    return location === path;
  };

  const getDashboardLink = () => {
    if (!user) return "/auth";

    switch (user.role) {
      case UserRole.JOB_SEEKER:
        return "/dashboard/job-seeker";
      case UserRole.EMPLOYER:
        return "/dashboard/employer";
      case UserRole.ADMIN:
        return "/dashboard/admin";
      default:
        return "/";
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-2xl">seek<span className="text-indigo-500">withDami</span></span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link href="/" className={`${isActivePath("/") ? "border-primary text-gray-900 border-b-2" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"} px-1 pt-1 text-sm font-medium`}>
                Home
              </Link>
              <Link href="/jobs" className={`${isActivePath("/jobs") ? "border-primary text-gray-900 border-b-2" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"} px-1 pt-1 text-sm font-medium`}>
                Find Jobs
              </Link>
              <Link href="/" className={`${isActivePath("/companies") ? "border-primary text-gray-900 border-b-2" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"} px-1 pt-1 text-sm font-medium`}>
                Companies
              </Link>
              <Link href="/" className={`${isActivePath("/advice") ? "border-primary text-gray-900 border-b-2" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"} px-1 pt-1 text-sm font-medium`}>
                Career Advice
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            {user ? (
              <div className="flex items-center">
                <Link href={getDashboardLink()} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.firstName} {user.lastName}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-xs text-gray-500">{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/auth" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Log in
                </Link>
                <Link href="/auth?tab=register" className="ml-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign up
                </Link>
                <Link href="/auth?tab=register&role=employer" className="ml-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  For Employers
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className={`${isActivePath("/") ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Home
            </Link>
            <Link href="/jobs" className={`${isActivePath("/jobs") ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Find Jobs
            </Link>
            <Link href="/" className={`${isActivePath("/companies") ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Companies
            </Link>
            <Link href="/" className={`${isActivePath("/advice") ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Career Advice
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex flex-col px-4">
                <div className="flex items-center px-4 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link href={getDashboardLink()} className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center px-4">
                <Link href="/auth" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-base font-medium">
                  Log in
                </Link>
                <Link href="/auth?tab=register" className="ml-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-base font-medium">
                  Sign up
                </Link>
              </div>
            )}
            {!user && (
              <div className="mt-3 px-2 space-y-1">
                <Link href="/auth?tab=register&role=employer" className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  For Employers
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
