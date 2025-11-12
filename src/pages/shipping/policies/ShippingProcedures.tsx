import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingProcedures = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shipping/policies">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Policies
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">Shipping Procedures</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Guidelines and procedures for safe and efficient shipping
        </p>

        <div className="space-y-6">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Packaging Guidelines</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Use Appropriate Boxes</h3>
                <p>Select boxes that are sturdy and in good condition. Avoid reusing damaged boxes. 
                   Leave 2-3 inches of cushioning space around all items.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Protect Your Items</h3>
                <p>Use bubble wrap, packing peanuts, or foam for fragile items. Wrap each item individually 
                   and fill empty spaces to prevent shifting during transit.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Seal Properly</h3>
                <p>Use strong packing tape (not duct tape or masking tape) to seal all seams. 
                   Apply tape in an H-pattern across the top and bottom of the box.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Label Clearly</h3>
                <p>Place shipping labels on the top of the package. Remove or cover old labels. 
                   Mark "Fragile" if applicable.</p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Service Levels</h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Standard Shipping</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Delivery within 5-7 business days
                </p>
                <p className="text-sm text-muted-foreground">
                  Most economical option for non-urgent shipments. Tracking included.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Express Shipping</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Delivery within 2-3 business days
                </p>
                <p className="text-sm text-muted-foreground">
                  Faster delivery for time-sensitive shipments. Priority handling included.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Overnight Shipping</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Next business day delivery
                </p>
                <p className="text-sm text-muted-foreground">
                  Fastest option available. Guaranteed delivery by end of next business day.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Size & Weight Limits</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-1">26ft Box Trucks</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Maximum weight: 10,000 lbs per shipment</li>
                  <li>Maximum dimensions: 24' L × 8' W × 8' H</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">53ft Tractor Trailers</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Maximum weight: 45,000 lbs per shipment</li>
                  <li>Maximum dimensions: 53' L × 8.5' W × 9' H</li>
                </ul>
              </div>
              <div className="pt-2">
                <p className="text-sm">
                  For oversized or overweight shipments, contact our freight team at 
                  <strong> freight@cwexpress.com</strong>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Signature Requirements</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Standard Signature:</strong> Included with all shipments. Delivery requires 
                a signature from anyone at the delivery address.
              </p>
              <p>
                <strong>Adult Signature:</strong> Available for age-restricted items. 
                Requires signature from someone 21+ with valid ID.
              </p>
              <p>
                <strong>Direct Signature:</strong> Requires signature from the addressee only. 
                No alternative recipients allowed.
              </p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pickup & Drop-off</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Scheduled Pickup</h3>
                <p>Schedule pickups online or by phone. Our driver will come to your location 
                   during the scheduled window (typically 2-hour windows).</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Drop-off Locations</h3>
                <p>Drop off packages at any of our depot locations during business hours. 
                   Locations available in Las Vegas, Los Angeles, Phoenix, and San Diego.</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-muted">
            <h2 className="text-xl font-bold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Our shipping experts are here to help with your questions
            </p>
            <div className="space-y-2 text-sm">
              <p>Phone: <strong>1-800-CW-EXPRESS</strong></p>
              <p>Email: <strong>shipping@cwexpress.com</strong></p>
              <p>Hours: Monday - Friday, 8:00 AM - 6:00 PM PST</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShippingProcedures;
