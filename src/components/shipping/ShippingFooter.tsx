import { Mail, Phone, MapPin } from 'lucide-react';

export const ShippingFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-CW-EXPRESS</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>shipping@cwexpress.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Las Vegas, NV</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/shipping/track" className="hover:text-foreground transition-colors">Track Package</a></li>
              <li><a href="/shipping/ship" className="hover:text-foreground transition-colors">Ship Now</a></li>
              <li><a href="/shipping/fleet" className="hover:text-foreground transition-colors">Fleet Information</a></li>
              <li><a href="/shipping/policies" className="hover:text-foreground transition-colors">Policies</a></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Business Hours</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Monday - Friday: 8:00 AM - 6:00 PM</div>
              <div>Saturday: 9:00 AM - 4:00 PM</div>
              <div>Sunday: Closed</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CW Express Shipping & Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
