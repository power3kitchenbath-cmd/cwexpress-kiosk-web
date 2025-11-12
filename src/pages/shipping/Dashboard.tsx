import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, Truck, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockShipments } from '@/data/mockShipments';
import { fleetStats } from '@/data/mockFleet';
import { ShipmentCard } from '@/components/shipping/ShipmentCard';

const Dashboard = () => {
  const activeShipments = mockShipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery');
  const deliveriesToday = mockShipments.filter(s => {
    const today = new Date();
    return s.estimatedDelivery.toDateString() === today.toDateString();
  });

  const fleetUtilization = Math.round((fleetStats.active / fleetStats.total) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          CW Express Shipping
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Professional logistics and shipping solutions powered by our fleet of 26ft box trucks and 53ft tractor trailers
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/shipping/ship">
            <Button size="lg" className="gap-2">
              <Package className="h-5 w-5" />
              Ship Now
            </Button>
          </Link>
          <Link to="/shipping/track">
            <Button size="lg" variant="outline" className="gap-2">
              <Truck className="h-5 w-5" />
              Track Package
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shipments</p>
              <p className="text-2xl font-bold text-foreground">{activeShipments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deliveries Today</p>
              <p className="text-2xl font-bold text-foreground">{deliveriesToday.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Fleet</p>
              <p className="text-2xl font-bold text-foreground">{fleetStats.active} / {fleetStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fleet Utilization</p>
              <p className="text-2xl font-bold text-foreground">{fleetUtilization}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Shipments */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Shipments</h2>
          <Link to="/shipping/track">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {mockShipments.slice(0, 3).map(shipment => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
