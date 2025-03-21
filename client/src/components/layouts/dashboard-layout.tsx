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
  Menu,
  LogOut,
  User,
  Briefcase,
  Building,
  BookmarkIcon,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Check if a specific route is active
  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  const getNavItems = () => {
    const commonItems = [
      {
        name: "Profile",
        href: "/dashboard/profile",
        icon: <User className="h-5 w-5 mr-3" />,
      },
    ];

    const roleSpecificItems = {
      job_seeker: [
        {
          name: "Dashboard",
          href: "/dashboard/seeker",
          icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
        },
        {
          name: "Applications",
          href: "/dashboard/applications",
          icon: <FileText className="h-5 w-5 mr-3" />,
        },
        {
          name: "Saved Jobs",
          href: "/dashboard/saved-jobs",
          icon: <BookmarkIcon className="h-5 w-5 mr-3" />,
        },
      ],
      employer: [
        {
          name: "Dashboard",
          href: "/dashboard/employer",
          icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
        },
        {
          name: "Post a Job",
          href: "/dashboard/post-job",
          icon: <Briefcase className="h-5 w-5 mr-3" />,
        },
        {
          name: "Company Profile",
          href: "/dashboard/company",
          icon: <Building className="h-5 w-5 mr-3" />,
        },
      ],
      admin: [
        {
          name: "Dashboard",
          href: "/dashboard/admin",
          icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
        },
        {
          name: "Users",
          href: "/dashboard/admin/users",
          icon: <Users className="h-5 w-5 mr-3" />,
        },
        {
          name: "Jobs",
          href: "/dashboard/admin/jobs",
          icon: <Briefcase className="h-5 w-5 mr-3" />,
        },
        {
          name: "Companies",
          href: "/dashboard/admin/companies",
          icon: <Building className="h-5 w-5 mr-3" />,
        },
      ],
    };

    // @ts-ignore - We know user.role will be one of the keys in roleSpecificItems
    return [...roleSpecificItems[user.role], ...commonItems];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold font-heading">
                  <span className="text-primary">seek</span>
                  <span className="text-green-500">with</span>
                  <span className="text-primary">Dami</span>
                </span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navItems.slice(0, 3).map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`text-gray-600 hover:text-primary border-transparent hover:border-primary border-b-2 px-1 pt-1 font-medium ${
                        isActive(item.href)
                          ? "border-primary text-primary"
                          : ""
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="p-1 rounded-full text-gray-600 hover:text-primary mr-4"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || ""} alt={user.firstName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <a className="flex items-center w-full cursor-pointer">
                          {React.cloneElement(item.icon, { className: "mr-2 h-4 w-4" })}
                          <span>{item.name}</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="ml-2 flex md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center mb-6">
                        <Link
                          href="/"
                          className="text-xl font-bold font-heading"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="text-primary">seek</span>
                          <span className="text-green-500">with</span>
                          <span className="text-primary">Dami</span>
                        </Link>
                      </div>

                      <div className="flex items-center mb-6 px-2">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.avatar || ""} alt={user.firstName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <a
                              className={`flex items-center px-2 py-3 text-base rounded-md ${
                                isActive(item.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {item.icon}
                              {item.name}
                              <ChevronRight className="ml-auto h-5 w-5" />
                            </a>
                          </Link>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 border-t border-gray-200">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            logoutMutation.mutate();
                            setMobileMenuOpen(false);
                          }}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {logoutMutation.isPending ? "Logging out..." : "Log out"}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
