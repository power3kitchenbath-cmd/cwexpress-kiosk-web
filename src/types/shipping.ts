export type ShipmentStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
export type VehicleType = '26ft-box' | '53ft-trailer';
export type TrackingStatus = 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
}

export interface PackageDetails {
  weight: number; // lbs
  length: number; // inches
  width: number; // inches
  height: number; // inches
  contents: string;
  value: number;
  insurance?: boolean;
}

export interface Location {
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

export interface TrackingEvent {
  id: string;
  timestamp: Date;
  location: string;
  status: TrackingStatus;
  description: string;
  scanType: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  plateNumber: string;
  capacity: {
    weight: number; // lbs
    volume: number; // cubic feet
  };
  currentLocation?: Location;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  sender: Address;
  recipient: Address;
  package: PackageDetails;
  status: ShipmentStatus;
  timeline: TrackingEvent[];
  estimatedDelivery: Date;
  createdAt: Date;
  assignedVehicle?: Vehicle;
  serviceType: 'standard' | 'express' | 'overnight';
  rate: number;
}
