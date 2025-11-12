import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shipping/policies">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Policies
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">Return Policy</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: November 12, 2024
        </p>

        <div className="space-y-6">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Return Timeframe</h2>
            <p className="text-muted-foreground mb-4">
              Returns must be initiated within <strong>30 days</strong> of the original delivery date. 
              Items must be in their original condition, unused, and in original packaging.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>Contact our customer service at 1-800-CW-EXPRESS or returns@cwexpress.com</li>
              <li>Provide your original tracking number and reason for return</li>
              <li>Receive a Return Authorization (RA) number and return shipping label</li>
              <li>Package the item securely in original packaging</li>
              <li>Attach the return label and drop off at any of our locations</li>
            </ol>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Return Shipping</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Buyer's Remorse:</strong> Customer is responsible for return shipping costs
              </p>
              <p>
                <strong>Damaged or Defective Items:</strong> We will provide a prepaid return label at no cost
              </p>
              <p>
                <strong>Wrong Item Shipped:</strong> We will arrange pickup at no cost to you
              </p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Refund Process</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Once we receive and inspect your return, we will process your refund within 
                <strong> 5-7 business days</strong>.
              </p>
              <p>
                Refunds will be issued to the original payment method. Please allow an additional 
                3-5 business days for the refund to appear in your account.
              </p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Perishable goods</li>
              <li>Custom or personalized items</li>
              <li>Items marked as final sale</li>
              <li>Items without original packaging or tags</li>
              <li>Items showing signs of use or wear</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Exchanges</h2>
            <p className="text-muted-foreground">
              We do not offer direct exchanges at this time. If you need a different item, 
              please return the original item for a refund and place a new order.
            </p>
          </Card>

          <Card className="p-8 bg-muted">
            <h2 className="text-xl font-bold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our return policy, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p>Phone: <strong>1-800-CW-EXPRESS</strong></p>
              <p>Email: <strong>returns@cwexpress.com</strong></p>
              <p>Hours: Monday - Friday, 8:00 AM - 6:00 PM PST</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
