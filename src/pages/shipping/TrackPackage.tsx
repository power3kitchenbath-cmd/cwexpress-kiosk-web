import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { mockShipments } from '@/data/mockShipments';
import { ShipmentCard } from '@/components/shipping/ShipmentCard';
import { useToast } from '@/hooks/use-toast';

const TrackPackage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchResults, setSearchResults] = useState(mockShipments);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!trackingNumber.trim()) {
      setSearchResults(mockShipments);
      return;
    }

    const results = mockShipments.filter(s => 
      s.trackingNumber.toLowerCase().includes(trackingNumber.toLowerCase())
    );

    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No shipments found with that tracking number.",
        variant: "destructive"
      });
    }

    setSearchResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Track Your Package</h1>
          <p className="text-muted-foreground">
            Enter your tracking number to see the current status and location of your shipment
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-12">
          <Input
            placeholder="Enter tracking number (e.g., CWEXP123ABC456)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Track
          </Button>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {trackingNumber ? 'Search Results' : 'Recent Shipments'}
          </h2>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(shipment => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No shipments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackPackage;
