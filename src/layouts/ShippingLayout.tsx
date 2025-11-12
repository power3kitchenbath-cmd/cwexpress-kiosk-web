import { Outlet } from 'react-router-dom';
import { ShippingHeader } from '@/components/shipping/ShippingHeader';
import { ShippingFooter } from '@/components/shipping/ShippingFooter';

export const ShippingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ShippingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ShippingFooter />
    </div>
  );
};
