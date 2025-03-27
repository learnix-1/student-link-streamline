
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Briefcase, 
  Building, 
  School, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/students', name: 'Students', icon: Users },
    { path: '/companies', name: 'Companies', icon: Briefcase },
    { path: '/placements', name: 'Placements', icon: Building },
  ];
  
  if (role === 'master_admin') {
    navItems.push({ path: '/schools', name: 'Schools', icon: School });
    navItems.push({ path: '/users', name: 'Users', icon: Users });
  } else if (role === 'project_lead') {
    navItems.push({ path: '/users', name: 'Placement Officers', icon: Users });
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-semibold text-foreground">
              PlaceTrack
            </Link>
          </div>

          {isMobile ? (
            <>
              <Button variant="ghost" onClick={toggleMobileMenu} className="p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
              {mobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 z-50 bg-card shadow-lg border-b border-border animate-fade-in">
                  <nav className="flex flex-col py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center px-6 py-3 text-base hover-transition",
                          location.pathname === item.path
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base text-muted-foreground hover:text-primary hover-transition"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center text-sm hover-transition",
                      location.pathname === item.path
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user?.name} ({role})
                </span>
                <Button variant="ghost" size="sm" onClick={logout} className="hover-transition">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
