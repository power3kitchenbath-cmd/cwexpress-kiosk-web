import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, Shield, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Policies = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Policies & Procedures</h1>
          <p className="text-lg text-muted-foreground">
            Review our shipping policies, return procedures, and terms of service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link to="/shipping/policies/returns">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Return Policy</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn about our return process, timeframes, and conditions
                  </p>
                  <Button variant="outline" size="sm">Read More</Button>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/shipping/policies/shipping-procedures">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Shipping Procedures</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Packaging guidelines, prohibited items, and delivery timeframes
                  </p>
                  <Button variant="outline" size="sm">Read More</Button>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Insurance */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="h-6 w-6 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Insurance & Liability</h2>
              <p className="text-muted-foreground">
                All shipments are protected with our standard liability coverage
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2">Standard Coverage</h3>
              <p className="text-muted-foreground">
                Basic protection up to $100 per shipment is included at no extra cost
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Additional Insurance</h3>
              <p className="text-muted-foreground">
                For high-value items, we offer additional insurance coverage at 2% of declared value
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Claims Process</h3>
              <p className="text-muted-foreground">
                Claims must be filed within 30 days of delivery or scheduled delivery date. 
                Contact our claims department at claims@cwexpress.com
              </p>
            </div>
          </div>
        </Card>

        {/* Prohibited Items */}
        <Card className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Prohibited Items</h2>
              <p className="text-muted-foreground">
                The following items cannot be shipped through our service
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Hazardous materials</li>
                <li>• Flammable liquids or gases</li>
                <li>• Explosives or ammunition</li>
                <li>• Illegal substances</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Perishable food items</li>
                <li>• Live animals</li>
                <li>• Cash or negotiable instruments</li>
                <li>• Irreplaceable items (art, heirlooms)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Policies;
