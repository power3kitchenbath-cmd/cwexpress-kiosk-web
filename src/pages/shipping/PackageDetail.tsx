import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, MapPin, Truck } from 'lucide-react';
import { mockShipments } from '@/data/mockShipments';
import { TrackingTimeline } from '@/components/shipping/TrackingTimeline';
import { format } from 'date-fns';

const PackageDetail = () => {
  const { trackingNumber } = useParams();
  const shipment = mockShipments.find(s => s.trackingNumber === trackingNumber);

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Shipment Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find a shipment with tracking number: {trackingNumber}
        </p>
        <Link to="/shipping/track">
          <Button>Back to Tracking</Button>
        </Link>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    in_transit: 'bg-blue-500/10 text-blue-500',
    out_for_delivery: 'bg-orange-500/10 text-orange-500',
    delivered: 'bg-green-500/10 text-green-500',
    exception: 'bg-destructive/10 text-destructive'
  };

  const statusLabels = {
    pending: 'Pending',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    exception: 'Exception'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shipping/track">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tracking
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Tracking Details
              </h1>
              <p className="font-mono text-muted-foreground">{shipment.trackingNumber}</p>
            </div>
            <Badge className={`${statusColors[shipment.status]} text-base px-4 py-2`}>
              {statusLabels[shipment.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
              <p className="font-medium text-foreground">
                {format(shipment.estimatedDelivery, 'EEEE, MMMM dd, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                By {format(shipment.estimatedDelivery, 'h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Service Type</p>
              <p className="font-medium text-foreground capitalize">{shipment.serviceType}</p>
            </div>
          </div>
        </Card>

        {/* Tracking Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tracking History
          </h2>
          <TrackingTimeline events={shipment.timeline} />
        </Card>

        {/* Package & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient */}
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Recipient
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{shipment.recipient.name}</p>
              <p className="text-muted-foreground">{shipment.recipient.street}</p>
              <p className="text-muted-foreground">
                {shipment.recipient.city}, {shipment.recipient.state} {shipment.recipient.zipCode}
              </p>
              <p className="text-muted-foreground">{shipment.recipient.phone}</p>
            </div>
          </Card>

          {/* Sender */}
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sender
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{shipment.sender.name}</p>
              <p className="text-muted-foreground">{shipment.sender.street}</p>
              <p className="text-muted-foreground">
                {shipment.sender.city}, {shipment.sender.state} {shipment.sender.zipCode}
              </p>
              <p className="text-muted-foreground">{shipment.sender.phone}</p>
            </div>
          </Card>
        </div>

        {/* Package Info */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Weight</p>
              <p className="font-medium">{shipment.package.weight} lbs</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Dimensions</p>
              <p className="font-medium">
                {shipment.package.length}" × {shipment.package.width}" × {shipment.package.height}"
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Contents</p>
              <p className="font-medium">{shipment.package.contents}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Value</p>
              <p className="font-medium">${shipment.package.value}</p>
            </div>
          </div>
        </Card>

        {/* Assigned Vehicle */}
        {shipment.assignedVehicle && (
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Assigned Vehicle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Vehicle Type</p>
                <p className="font-medium capitalize">{shipment.assignedVehicle.type.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Plate Number</p>
                <p className="font-medium">{shipment.assignedVehicle.plateNumber}</p>
              </div>
              {shipment.assignedVehicle.currentLocation && (
                <div>
                  <p className="text-muted-foreground mb-1">Current Location</p>
                  <p className="font-medium">
                    {shipment.assignedVehicle.currentLocation.city}, {shipment.assignedVehicle.currentLocation.state}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PackageDetail;
