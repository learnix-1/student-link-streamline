
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export const Navbar = () => {
  const { isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <a href="/" className="flex items-center">
          <span className="font-bold text-xl">Placement System</span>
        </a>
        
        {!isMobile ? (
          <div className="ml-8 flex items-center space-x-6">
            {isAuthenticated && role === 'master_admin' && (
              <>
                <NavLink to="/dashboard" className="text-sm font-medium hover:underline">Dashboard</NavLink>
                <NavLink to="/schools" className="text-sm font-medium hover:underline">Schools</NavLink>
                <NavLink to="/users" className="text-sm font-medium hover:underline">Users</NavLink>
              </>
            )}
            {isAuthenticated && (role === 'project_lead' || role === 'placement_officer') && (
              <>
                <NavLink to="/dashboard" className="text-sm font-medium hover:underline">Dashboard</NavLink>
                <NavLink to="/students" className="text-sm font-medium hover:underline">Students</NavLink>
                <NavLink to="/companies" className="text-sm font-medium hover:underline">Companies</NavLink>
                <NavLink to="/placements" className="text-sm font-medium hover:underline">Placements</NavLink>
              </>
            )}
            {isAuthenticated && (role === 'master_admin' || role === 'project_lead') && (
              <NavLink to="/officer-performance" className="text-sm font-medium hover:underline">Officer Performance</NavLink>
            )}
          </div>
        ) : (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the placement system.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex flex-col space-y-2">
                {isAuthenticated && role === 'master_admin' && (
                  <>
                    <NavLink to="/dashboard" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                    <NavLink to="/schools" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Schools</NavLink>
                    <NavLink to="/users" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Users</NavLink>
                  </>
                )}
                {isAuthenticated && (role === 'project_lead' || role === 'placement_officer') && (
                  <>
                    <NavLink to="/dashboard" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                    <NavLink to="/students" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Students</NavLink>
                    <NavLink to="/companies" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Companies</NavLink>
                    <NavLink to="/placements" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Placements</NavLink>
                  </>
                )}
                 {isAuthenticated && (role === 'master_admin' || role === 'project_lead') && (
                  <NavLink to="/officer-performance" className="text-sm font-medium hover:underline block" onClick={() => setMobileMenuOpen(false)}>Officer Performance</NavLink>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLogin}>Login</Button>
          )}
        </div>
      </div>
    </div>
  );
};
