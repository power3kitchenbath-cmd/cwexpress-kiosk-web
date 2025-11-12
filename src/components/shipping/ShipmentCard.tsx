import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Calendar } from 'lucide-react';
import { Shipment } from '@/types/shipping';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ShipmentCardProps {
  shipment: Shipment;
}

export const ShipmentCard = ({ shipment }: ShipmentCardProps) => {
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
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-medium">{shipment.trackingNumber}</span>
            <Badge className={statusColors[shipment.status]}>
              {statusLabels[shipment.status]}
            </Badge>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{shipment.recipient.city}, {shipment.recipient.state}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Est. Delivery: {format(shipment.estimatedDelivery, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-sm">
            <div className="font-medium text-foreground">{shipment.recipient.name}</div>
          </div>
          <Link to={`/shipping/track/${shipment.trackingNumber}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
