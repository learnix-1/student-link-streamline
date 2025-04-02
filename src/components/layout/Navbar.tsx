
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

type NavLinkProps = {
  to: string;
  label: string;
  isMobile?: boolean;
};

const NavLink = ({ to, label, isMobile = false }: NavLinkProps) => {
  const baseClasses = "transition-colors";
  const desktopClasses = "px-4 py-2 rounded-md hover:bg-accent";
  const mobileClasses = "block py-2 px-3 rounded-md hover:bg-accent";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
    >
      {label}
    </Link>
  );
};

const Navbar = () => {
  const isMobile = useMobile();
  const { isAuthenticated, logout, role } = useAuth();

  // Define nav items based on authentication state and role
  const navItems = [
    { to: "/dashboard", label: "Dashboard", requiredAuth: true },
    { to: "/students", label: "Students", requiredAuth: true },
    { to: "/companies", label: "Companies", requiredAuth: true },
    { to: "/placements", label: "Placements", requiredAuth: true },
    { to: "/schools", label: "Schools", requiredAuth: true },
    { 
      to: "/users", 
      label: "Users", 
      requiredAuth: true,
      requiredRoles: ['master_admin', 'project_lead'] 
    },
    { 
      to: "/officer-performance", 
      label: "Performance", 
      requiredAuth: true,
      requiredRoles: ['master_admin', 'project_lead'] 
    },
  ];

  // Filter nav items based on auth state and role
  const filteredNavItems = navItems.filter(item => {
    if (item.requiredAuth && !isAuthenticated) return false;
    if (item.requiredRoles && (!role || !item.requiredRoles.includes(role))) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-full items-center">
        <Link to="/" className="font-bold text-xl mr-6">
          PlaceTrack
        </Link>
        {isAuthenticated && (
          <>
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-auto">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] pr-0">
                  <nav className="flex flex-col mt-6 space-y-2">
                    {filteredNavItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        isMobile
                      />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            ) : (
              <nav className="hidden md:flex items-center space-x-2 mr-6">
                {filteredNavItems.map((item) => (
                  <NavLink key={item.to} to={item.to} label={item.label} />
                ))}
              </nav>
            )}
          </>
        )}

        <div className="flex items-center ml-auto gap-2">
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
