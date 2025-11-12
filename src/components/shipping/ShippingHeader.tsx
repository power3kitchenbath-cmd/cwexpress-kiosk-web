import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const ShippingHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/shipping', label: 'Dashboard' },
    { path: '/shipping/ship', label: 'Ship Now' },
    { path: '/shipping/track', label: 'Track' },
    { path: '/shipping/fleet', label: 'Fleet' },
    { path: '/shipping/policies', label: 'Policies' },
    { path: '/shipping/contact', label: 'Contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/shipping') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/shipping" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">CW Express</h1>
              <p className="text-xs text-muted-foreground">Shipping & Logistics</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Kiosk Link & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden md:block">
              <Button variant="outline" size="sm">
                Kiosk Mode
              </Button>
            </Link>
            
            <button
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Kiosk Mode
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
