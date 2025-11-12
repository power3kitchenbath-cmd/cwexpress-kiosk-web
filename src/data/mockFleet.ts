import { Vehicle } from '@/types/shipping';

export const mockFleet: Vehicle[] = [
  {
    id: 'v1',
    type: '26ft-box',
    plateNumber: 'NV-2345',
    capacity: { weight: 10000, volume: 1400 },
    currentLocation: { city: 'Las Vegas', state: 'NV' },
    status: 'active'
  },
  {
    id: 'v2',
    type: '26ft-box',
    plateNumber: 'CA-8901',
    capacity: { weight: 10000, volume: 1400 },
    currentLocation: { city: 'Los Angeles', state: 'CA' },
    status: 'active'
  },
  {
    id: 'v3',
    type: '53ft-trailer',
    plateNumber: 'NV-4567',
    capacity: { weight: 45000, volume: 3800 },
    currentLocation: { city: 'Phoenix', state: 'AZ' },
    status: 'active'
  },
  {
    id: 'v4',
    type: '26ft-box',
    plateNumber: 'NV-7890',
    capacity: { weight: 10000, volume: 1400 },
    status: 'maintenance'
  },
  {
    id: 'v5',
    type: '53ft-trailer',
    plateNumber: 'CA-1234',
    capacity: { weight: 45000, volume: 3800 },
    currentLocation: { city: 'San Diego', state: 'CA' },
    status: 'active'
  }
];

export const fleetStats = {
  total: 18,
  active: 12,
  maintenance: 3,
  inactive: 3,
  boxTrucks: {
    total: 12,
    active: 8,
    capacity: { weight: 10000, volume: 1400 }
  },
  trailers: {
    total: 6,
    active: 4,
    capacity: { weight: 45000, volume: 3800 }
  }
};
