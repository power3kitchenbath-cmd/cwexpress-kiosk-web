import { Card } from '@/components/ui/card';
import { Truck, Package, MapPin, Wrench } from 'lucide-react';
import { fleetStats, mockFleet } from '@/data/mockFleet';

const Fleet = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Fleet</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional logistics powered by our modern fleet of box trucks and tractor trailers
          </p>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold text-foreground">{fleetStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{fleetStats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-foreground">{fleetStats.maintenance}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((fleetStats.active / fleetStats.total) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 26ft Box Trucks */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">26ft Box Trucks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Specifications</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Cargo Capacity: {fleetStats.boxTrucks.capacity.volume} cubic feet</li>
                <li>• Weight Capacity: {fleetStats.boxTrucks.capacity.weight.toLocaleString()} lbs</li>
                <li>• Lift Gate Equipped</li>
                <li>• GPS Tracking</li>
                <li>• Climate Controlled Available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Ideal For</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Local and regional deliveries</li>
                <li>• Furniture and appliances</li>
                <li>• Commercial equipment</li>
                <li>• Residential moves</li>
                <li>• Multiple stop deliveries</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fleet Status:</span>
              <span className="font-medium">{fleetStats.boxTrucks.active} of {fleetStats.boxTrucks.total} active</span>
            </div>
          </div>
        </Card>

        {/* 53ft Tractor Trailers */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">53ft Tractor Trailers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Specifications</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Cargo Capacity: {fleetStats.trailers.capacity.volume} cubic feet</li>
                <li>• Weight Capacity: {fleetStats.trailers.capacity.weight.toLocaleString()} lbs</li>
                <li>• Dry Van & Refrigerated Options</li>
                <li>• Air Ride Suspension</li>
                <li>• Real-Time GPS Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Ideal For</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Long-haul interstate shipping</li>
                <li>• Full truckload (FTL) shipments</li>
                <li>• Large commercial deliveries</li>
                <li>• Temperature-sensitive cargo</li>
                <li>• Palletized freight</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fleet Status:</span>
              <span className="font-medium">{fleetStats.trailers.active} of {fleetStats.trailers.total} active</span>
            </div>
          </div>
        </Card>

        {/* Service Areas */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Service Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-foreground mb-3">Western Region</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>California</li>
                <li>Nevada</li>
                <li>Arizona</li>
                <li>Utah</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Mountain Region</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Colorado</li>
                <li>New Mexico</li>
                <li>Wyoming</li>
                <li>Montana</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Southwest Region</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Texas</li>
                <li>Oklahoma</li>
                <li>Arkansas</li>
                <li>Louisiana</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Fleet;
