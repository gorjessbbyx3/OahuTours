import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/packages", label: "Tour Packages" },
    { href: "/custom-tour", label: "Custom Tours" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <div className="text-2xl font-bold text-primary">Oahu Elite Tours</div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <span
                    className={`nav-link text-foreground hover:text-primary smooth-transition font-medium ${
                      location === item.href ? 'text-primary' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated && user?.isAdmin && (
                <Link href="/admin/dashboard" data-testid="link-admin">
                  <span className="nav-link text-foreground hover:text-primary smooth-transition font-medium">
                    Admin
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Book Now Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/booking">
              <Button data-testid="button-book-now">
                Book Now
              </Button>
            </Link>
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-profile"
                  />
                )}
                <span className="text-sm text-foreground" data-testid="text-username">
                  {user?.firstName || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div
                    className={`block px-3 py-2 text-base font-medium hover:text-primary smooth-transition ${
                      location === item.href ? 'text-primary' : 'text-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
              {isAuthenticated && user?.isAdmin && (
                <Link href="/admin/dashboard" data-testid="mobile-link-admin">
                  <div
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary smooth-transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </div>
                </Link>
              )}
              <Link href="/booking" data-testid="mobile-link-book-now">
                <div
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary smooth-transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Now
                </div>
              </Link>
              {isAuthenticated && (
                <div className="px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="w-full"
                    data-testid="mobile-button-logout"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
