export function generateTrackingNumber(): string {
  const prefix = 'CWEXP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function calculateRate(weight: number, distance: number, serviceType: 'standard' | 'express' | 'overnight'): number {
  const baseRate = 15;
  const weightRate = weight * 0.5;
  const distanceRate = distance * 0.02;
  
  const multipliers = {
    standard: 1,
    express: 1.5,
    overnight: 2.5
  };
  
  return Math.round((baseRate + weightRate + distanceRate) * multipliers[serviceType] * 100) / 100;
}

export function formatTrackingNumber(trackingNumber: string): string {
  return trackingNumber.replace(/(.{5})/g, '$1-').slice(0, -1);
}
