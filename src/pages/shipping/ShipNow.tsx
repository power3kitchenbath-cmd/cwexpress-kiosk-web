import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generateTrackingNumber, calculateRate } from '@/utils/trackingGenerator';

type Step = 'sender' | 'recipient' | 'package' | 'service' | 'review';

const ShipNow = () => {
  const [currentStep, setCurrentStep] = useState<Step>('sender');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sender: { name: '', street: '', city: '', state: '', zipCode: '', phone: '', email: '' },
    recipient: { name: '', street: '', city: '', state: '', zipCode: '', phone: '', email: '' },
    package: { weight: '', length: '', width: '', height: '', contents: '', value: '' },
    serviceType: 'standard' as 'standard' | 'express' | 'overnight'
  });

  const steps: { id: Step; title: string; number: number }[] = [
    { id: 'sender', title: 'Sender Info', number: 1 },
    { id: 'recipient', title: 'Recipient Info', number: 2 },
    { id: 'package', title: 'Package Details', number: 3 },
    { id: 'service', title: 'Service Type', number: 4 },
    { id: 'review', title: 'Review', number: 5 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    const trackingNumber = generateTrackingNumber();
    toast({
      title: "Shipment Created!",
      description: `Tracking number: ${trackingNumber}`,
    });
    navigate(`/shipping/track/${trackingNumber}`);
  };

  const calculateShippingRate = () => {
    const weight = parseFloat(formData.package.weight) || 0;
    const distance = 250; // Mock distance
    return calculateRate(weight, distance, formData.serviceType);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Create Shipment</h1>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number}
                </div>
                <p className="text-xs mt-2 text-center">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Sender Information */}
          {currentStep === 'sender' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Sender Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name</Label>
                  <Input value={formData.sender.name} onChange={(e) => setFormData({...formData, sender: {...formData.sender, name: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Street Address</Label>
                  <Input value={formData.sender.street} onChange={(e) => setFormData({...formData, sender: {...formData.sender, street: e.target.value}})} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={formData.sender.city} onChange={(e) => setFormData({...formData, sender: {...formData.sender, city: e.target.value}})} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formData.sender.state} onChange={(e) => setFormData({...formData, sender: {...formData.sender, state: e.target.value}})} />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input value={formData.sender.zipCode} onChange={(e) => setFormData({...formData, sender: {...formData.sender, zipCode: e.target.value}})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.sender.phone} onChange={(e) => setFormData({...formData, sender: {...formData.sender, phone: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.sender.email} onChange={(e) => setFormData({...formData, sender: {...formData.sender, email: e.target.value}})} />
                </div>
              </div>
            </div>
          )}

          {/* Recipient Information */}
          {currentStep === 'recipient' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Recipient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name</Label>
                  <Input value={formData.recipient.name} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, name: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Street Address</Label>
                  <Input value={formData.recipient.street} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, street: e.target.value}})} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={formData.recipient.city} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, city: e.target.value}})} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formData.recipient.state} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, state: e.target.value}})} />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input value={formData.recipient.zipCode} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, zipCode: e.target.value}})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.recipient.phone} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, phone: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.recipient.email} onChange={(e) => setFormData({...formData, recipient: {...formData.recipient, email: e.target.value}})} />
                </div>
              </div>
            </div>
          )}

          {/* Package Details */}
          {currentStep === 'package' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Package Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input type="number" value={formData.package.weight} onChange={(e) => setFormData({...formData, package: {...formData.package, weight: e.target.value}})} />
                </div>
                <div>
                  <Label>Length (inches)</Label>
                  <Input type="number" value={formData.package.length} onChange={(e) => setFormData({...formData, package: {...formData.package, length: e.target.value}})} />
                </div>
                <div>
                  <Label>Width (inches)</Label>
                  <Input type="number" value={formData.package.width} onChange={(e) => setFormData({...formData, package: {...formData.package, width: e.target.value}})} />
                </div>
                <div>
                  <Label>Height (inches)</Label>
                  <Input type="number" value={formData.package.height} onChange={(e) => setFormData({...formData, package: {...formData.package, height: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Contents Description</Label>
                  <Input value={formData.package.contents} onChange={(e) => setFormData({...formData, package: {...formData.package, contents: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Declared Value ($)</Label>
                  <Input type="number" value={formData.package.value} onChange={(e) => setFormData({...formData, package: {...formData.package, value: e.target.value}})} />
                </div>
              </div>
            </div>
          )}

          {/* Service Type */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Select Service Type</h2>
              <div className="space-y-3">
                {(['standard', 'express', 'overnight'] as const).map((service) => (
                  <Card
                    key={service}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.serviceType === service ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({...formData, serviceType: service})}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold capitalize">{service} Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          {service === 'standard' && '5-7 business days'}
                          {service === 'express' && '2-3 business days'}
                          {service === 'overnight' && 'Next business day'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${calculateRate(parseFloat(formData.package.weight) || 0, 250, service).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Review Your Shipment</h2>
              
              <div>
                <h3 className="font-bold mb-2">From:</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.sender.name}<br />
                  {formData.sender.street}<br />
                  {formData.sender.city}, {formData.sender.state} {formData.sender.zipCode}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">To:</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.recipient.name}<br />
                  {formData.recipient.street}<br />
                  {formData.recipient.city}, {formData.recipient.state} {formData.recipient.zipCode}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Package:</h3>
                <p className="text-sm text-muted-foreground">
                  Weight: {formData.package.weight} lbs<br />
                  Dimensions: {formData.package.length}" × {formData.package.width}" × {formData.package.height}"<br />
                  Contents: {formData.package.contents}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Service:</h3>
                <p className="text-sm text-muted-foreground capitalize">{formData.serviceType} Shipping</p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Shipping Cost:</span>
                  <span>${calculateShippingRate().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            {currentStep !== 'review' ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                <Package className="h-4 w-4" />
                Create Shipment
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShipNow;
