import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu, 
  LogOut, 
  User, 
  Briefcase, 
  Building, 
  BookmarkIcon, 
  FileText
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation, redirectToDashboard } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if a specific route is active
  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold font-heading">
                  <span className="text-primary">seek</span>
                  <span className="text-green-500">with</span>
                  <span className="text-primary">Dami</span>
                </span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/">
                  <a className={`
                    text-gray-600 hover:text-primary border-transparent hover:border-primary border-b-2 px-1 pt-1 font-medium
                    ${isActive('/') ? 'border-primary text-primary' : ''}
                  `}>
                    Home
                  </a>
                </Link>
                <Link href="/jobs">
                  <a className={`
                    text-gray-600 hover:text-primary border-transparent hover:border-primary border-b-2 px-1 pt-1 font-medium
                    ${isActive('/jobs') ? 'border-primary text-primary' : ''}
                  `}>
                    Browse Jobs
                  </a>
                </Link>
                <Link href="/companies">
                  <a className={`
                    text-gray-600 hover:text-primary border-transparent hover:border-primary border-b-2 px-1 pt-1 font-medium
                    ${isActive('/companies') ? 'border-primary text-primary' : ''}
                  `}>
                    Companies
                  </a>
                </Link>
                <Link href="/resources">
                  <a className={`
                    text-gray-600 hover:text-primary border-transparent hover:border-primary border-b-2 px-1 pt-1 font-medium
                    ${isActive('/resources') ? 'border-primary text-primary' : ''}
                  `}>
                    Resources
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === "employer" && (
                    <Link href="/dashboard/post-job">
                      <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                        Post a Job
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || ""} alt={user.firstName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={redirectToDashboard()}>
                          <div className="flex items-center w-full cursor-pointer">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                          <div className="flex items-center w-full cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'job_seeker' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/applications">
                              <div className="flex items-center w-full cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Applications</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/saved-jobs">
                              <div className="flex items-center w-full cursor-pointer">
                                <BookmarkIcon className="mr-2 h-4 w-4" />
                                <span>Saved Jobs</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role === 'employer' && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/post-job">
                            <div className="flex items-center w-full cursor-pointer">
                              <Building className="mr-2 h-4 w-4" />
                              <span>Post a Job</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{logoutMutation.isPending ? 'Logging out...' : 'Log out'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link href="/auth?tab=login">
                    <Button variant="ghost" className="text-gray-600 hover:text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register&role=employer">
                    <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                      Post a Job
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-6 py-4">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <span className="text-xl font-bold font-heading">
                        <span className="text-primary">seek</span>
                        <span className="text-green-500">with</span>
                        <span className="text-primary">Dami</span>
                      </span>
                    </Link>
                    <div className="space-y-3">
                      <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                        <a className={`
                          block px-3 py-2 rounded-md text-base font-medium
                          ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                        `}>
                          Home
                        </a>
                      </Link>
                      <Link href="/jobs" onClick={() => setMobileMenuOpen(false)}>
                        <a className={`
                          block px-3 py-2 rounded-md text-base font-medium
                          ${isActive('/jobs') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                        `}>
                          Browse Jobs
                        </a>
                      </Link>
                      <Link href="/companies" onClick={() => setMobileMenuOpen(false)}>
                        <a className={`
                          block px-3 py-2 rounded-md text-base font-medium
                          ${isActive('/companies') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                        `}>
                          Companies
                        </a>
                      </Link>
                      <Link href="/resources" onClick={() => setMobileMenuOpen(false)}>
                        <a className={`
                          block px-3 py-2 rounded-md text-base font-medium
                          ${isActive('/resources') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                        `}>
                          Resources
                        </a>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      {user ? (
                        <>
                          <div className="px-3 flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={user.avatar || ""} alt={user.firstName} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Link href={redirectToDashboard()} onClick={() => setMobileMenuOpen(false)}>
                            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                              Dashboard
                            </a>
                          </Link>
                          <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                              Profile
                            </a>
                          </Link>
                          {user.role === 'job_seeker' && (
                            <>
                              <Link href="/dashboard/applications" onClick={() => setMobileMenuOpen(false)}>
                                <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                                  Applications
                                </a>
                              </Link>
                              <Link href="/dashboard/saved-jobs" onClick={() => setMobileMenuOpen(false)}>
                                <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                                  Saved Jobs
                                </a>
                              </Link>
                            </>
                          )}
                          {user.role === 'employer' && (
                            <Link href="/dashboard/post-job" onClick={() => setMobileMenuOpen(false)}>
                              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                                Post a Job
                              </a>
                            </Link>
                          )}
                          <Button 
                            variant="destructive" 
                            className="w-full mt-2"
                            onClick={() => {
                              logoutMutation.mutate();
                              setMobileMenuOpen(false);
                            }}
                            disabled={logoutMutation.isPending}
                          >
                            {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="px-3 space-y-2">
                            <Link href="/auth?tab=login" onClick={() => setMobileMenuOpen(false)}>
                              <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link href="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                              <Button className="w-full">Sign Up</Button>
                            </Link>
                            <Link href="/auth?tab=register&role=employer" onClick={() => setMobileMenuOpen(false)}>
                              <Button variant="secondary" className="w-full bg-green-500 hover:bg-green-600">Post a Job</Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold font-heading mb-4">
                <span className="text-primary">seek</span>
                <span className="text-green-500">with</span>
                <span className="text-primary">Dami</span>
              </h3>
              <p className="text-gray-300 mb-4">Connect with thousands of employers and discover opportunities that align with your career goals.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li><Link href="/jobs"><a className="text-gray-300 hover:text-white">Browse Jobs</a></Link></li>
                <li><Link href="/companies"><a className="text-gray-300 hover:text-white">Browse Companies</a></Link></li>
                <li><Link href="/resources/salary"><a className="text-gray-300 hover:text-white">Salary Information</a></Link></li>
                <li><Link href="/resources"><a className="text-gray-300 hover:text-white">Career Resources</a></Link></li>
                <li><Link href="/help"><a className="text-gray-300 hover:text-white">Help Center</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li><Link href="/auth?tab=register&role=employer"><a className="text-gray-300 hover:text-white">Post a Job</a></Link></li>
                <li><Link href="/talent"><a className="text-gray-300 hover:text-white">Browse Talent</a></Link></li>
                <li><Link href="/pricing"><a className="text-gray-300 hover:text-white">Pricing</a></Link></li>
                <li><Link href="/resources/employer"><a className="text-gray-300 hover:text-white">Employer Resources</a></Link></li>
                <li><Link href="/help/employer"><a className="text-gray-300 hover:text-white">Help Center</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about"><a className="text-gray-300 hover:text-white">About Us</a></Link></li>
                <li><Link href="/contact"><a className="text-gray-300 hover:text-white">Contact Us</a></Link></li>
                <li><Link href="/privacy"><a className="text-gray-300 hover:text-white">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="text-gray-300 hover:text-white">Terms of Service</a></Link></li>
                <li><Link href="/blog"><a className="text-gray-300 hover:text-white">Blog</a></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">&copy; 2023 seekwithDami. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <select className="bg-gray-700 text-white rounded-md py-1 px-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
