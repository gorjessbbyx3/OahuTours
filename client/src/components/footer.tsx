import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { user, isAuthenticated } = useAuth();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div data-testid="footer-brand">
            <div className="text-2xl font-bold text-primary mb-4">Oahu Elite Tours</div>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              Discover the magic of Oahu with our premium guided tour experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary smooth-transition"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary smooth-transition"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551-.684-.939-.684-2.085 0-3.025.684-.939 1.835-1.551 3.132-1.551s2.448.612 3.132 1.551c.684.94.684 2.086 0 3.025-.684.94-1.835 1.551-3.132 1.551z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary smooth-transition"
                data-testid="link-tripadvisor"
                aria-label="TripAdvisor"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.89 13.19c0 1.08-.87 1.95-1.94 1.95s-1.95-.87-1.95-1.95.87-1.94 1.95-1.94 1.94.86 1.94 1.94zM8.05 11.25c1.07 0 1.94.87 1.94 1.94s-.87 1.95-1.94 1.95-1.95-.87-1.95-1.95.88-1.94 1.95-1.94z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div data-testid="footer-tours">
            <h3 className="font-semibold mb-4">Tours</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/packages">
                  <span className="hover:text-primary smooth-transition cursor-pointer" data-testid="footer-link-day-tours">
                    Day Tours
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/packages">
                  <span className="hover:text-primary smooth-transition cursor-pointer" data-testid="footer-link-night-tours">
                    Night Tours
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/custom-tour">
                  <span className="hover:text-primary smooth-transition cursor-pointer" data-testid="footer-link-custom-tours">
                    Custom Experiences
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/booking">
                  <span className="hover:text-primary smooth-transition cursor-pointer" data-testid="footer-link-group-bookings">
                    Group Bookings
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div data-testid="footer-company">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-contact">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-reviews">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-careers">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          
          <div data-testid="footer-support">
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-policy">
                  Booking Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary smooth-transition" data-testid="footer-link-privacy">
                  Privacy Policy
                </a>
              </li>
              {isAuthenticated && user?.isAdmin && (
                <li>
                  <Link href="/admin/dashboard">
                    <span className="hover:text-primary smooth-transition cursor-pointer" data-testid="footer-link-admin">
                      Admin Portal
                    </span>
                  </Link>
                </li>
              )}
              {!isAuthenticated && (
                <li className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin/login'}
                    data-testid="footer-button-login"
                  >
                    Admin Login
                  </Button>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-muted mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="footer-copyright">&copy; 2024 Oahu Elite Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
