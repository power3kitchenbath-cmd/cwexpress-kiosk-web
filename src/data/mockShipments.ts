import { Shipment } from '@/types/shipping';

export const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'CWEXP123ABC456',
    sender: {
      name: 'John Smith',
      street: '123 Main St',
      city: 'Las Vegas',
      state: 'NV',
      zipCode: '89101',
      phone: '702-555-0100',
      email: 'john@example.com'
    },
    recipient: {
      name: 'Jane Doe',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      phone: '213-555-0200',
      email: 'jane@example.com'
    },
    package: {
      weight: 45,
      length: 24,
      width: 18,
      height: 12,
      contents: 'Electronics',
      value: 500,
      insurance: true
    },
    status: 'in_transit',
    timeline: [
      {
        id: '1',
        timestamp: new Date('2024-11-10T08:00:00'),
        location: 'Las Vegas, NV',
        status: 'label_created',
        description: 'Shipping label created',
        scanType: 'Label Created'
      },
      {
        id: '2',
        timestamp: new Date('2024-11-10T10:30:00'),
        location: 'Las Vegas, NV',
        status: 'picked_up',
        description: 'Package picked up',
        scanType: 'Pickup Scan'
      },
      {
        id: '3',
        timestamp: new Date('2024-11-10T14:45:00'),
        location: 'Barstow, CA',
        status: 'in_transit',
        description: 'In transit to Los Angeles',
        scanType: 'Transit Scan'
      }
    ],
    estimatedDelivery: new Date('2024-11-12T17:00:00'),
    createdAt: new Date('2024-11-10T08:00:00'),
    assignedVehicle: {
      id: 'v1',
      type: '26ft-box',
      plateNumber: 'NV-2345',
      capacity: { weight: 10000, volume: 1400 },
      currentLocation: { city: 'Barstow', state: 'CA' },
      status: 'active'
    },
    serviceType: 'express',
    rate: 125.50
  },
  {
    id: '2',
    trackingNumber: 'CWEXP789DEF012',
    sender: {
      name: 'Bob Johnson',
      street: '789 Pine St',
      city: 'Henderson',
      state: 'NV',
      zipCode: '89002',
      phone: '702-555-0300'
    },
    recipient: {
      name: 'Alice Williams',
      street: '321 Elm St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      phone: '619-555-0400'
    },
    package: {
      weight: 25,
      length: 18,
      width: 12,
      height: 10,
      contents: 'Documents',
      value: 100,
      insurance: false
    },
    status: 'out_for_delivery',
    timeline: [
      {
        id: '1',
        timestamp: new Date('2024-11-09T09:00:00'),
        location: 'Henderson, NV',
        status: 'label_created',
        description: 'Shipping label created',
        scanType: 'Label Created'
      },
      {
        id: '2',
        timestamp: new Date('2024-11-09T11:00:00'),
        location: 'Henderson, NV',
        status: 'picked_up',
        description: 'Package picked up',
        scanType: 'Pickup Scan'
      },
      {
        id: '3',
        timestamp: new Date('2024-11-10T08:00:00'),
        location: 'San Diego, CA',
        status: 'in_transit',
        description: 'Arrived at San Diego facility',
        scanType: 'Facility Scan'
      },
      {
        id: '4',
        timestamp: new Date('2024-11-11T06:00:00'),
        location: 'San Diego, CA',
        status: 'out_for_delivery',
        description: 'Out for delivery',
        scanType: 'Out for Delivery'
      }
    ],
    estimatedDelivery: new Date('2024-11-11T18:00:00'),
    createdAt: new Date('2024-11-09T09:00:00'),
    assignedVehicle: {
      id: 'v2',
      type: '26ft-box',
      plateNumber: 'CA-8901',
      capacity: { weight: 10000, volume: 1400 },
      currentLocation: { city: 'San Diego', state: 'CA' },
      status: 'active'
    },
    serviceType: 'standard',
    rate: 75.00
  },
  {
    id: '3',
    trackingNumber: 'CWEXP345GHI678',
    sender: {
      name: 'Carol Martinez',
      street: '555 Sunset Blvd',
      city: 'Las Vegas',
      state: 'NV',
      zipCode: '89103',
      phone: '702-555-0500'
    },
    recipient: {
      name: 'David Brown',
      street: '777 Beach Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      phone: '602-555-0600'
    },
    package: {
      weight: 150,
      length: 48,
      width: 36,
      height: 24,
      contents: 'Furniture',
      value: 1200,
      insurance: true
    },
    status: 'delivered',
    timeline: [
      {
        id: '1',
        timestamp: new Date('2024-11-08T10:00:00'),
        location: 'Las Vegas, NV',
        status: 'label_created',
        description: 'Shipping label created',
        scanType: 'Label Created'
      },
      {
        id: '2',
        timestamp: new Date('2024-11-08T13:00:00'),
        location: 'Las Vegas, NV',
        status: 'picked_up',
        description: 'Package picked up',
        scanType: 'Pickup Scan'
      },
      {
        id: '3',
        timestamp: new Date('2024-11-09T10:00:00'),
        location: 'Phoenix, AZ',
        status: 'in_transit',
        description: 'Arrived at Phoenix facility',
        scanType: 'Facility Scan'
      },
      {
        id: '4',
        timestamp: new Date('2024-11-10T07:00:00'),
        location: 'Phoenix, AZ',
        status: 'out_for_delivery',
        description: 'Out for delivery',
        scanType: 'Out for Delivery'
      },
      {
        id: '5',
        timestamp: new Date('2024-11-10T15:30:00'),
        location: 'Phoenix, AZ',
        status: 'delivered',
        description: 'Delivered - Signed by recipient',
        scanType: 'Delivery'
      }
    ],
    estimatedDelivery: new Date('2024-11-10T18:00:00'),
    createdAt: new Date('2024-11-08T10:00:00'),
    assignedVehicle: {
      id: 'v3',
      type: '53ft-trailer',
      plateNumber: 'NV-4567',
      capacity: { weight: 45000, volume: 3800 },
      status: 'active'
    },
    serviceType: 'standard',
    rate: 285.00
  }
];
