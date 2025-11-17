import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Estimator from "./pages/Estimator";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Estimates from "./pages/Estimates";
import DesignImport from "./pages/DesignImport";
import DesignViewer from "./pages/DesignViewer";
import LaunchPlan from "./pages/LaunchPlan";
import InvestorDeck from "./pages/InvestorDeck";
import Presentations from "./pages/Presentations";
import Power3InstallsPlan from "./pages/Power3InstallsPlan";
import OnlineShop from "./pages/OnlineShop";
import ProductManager from "./pages/ProductManager";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProProfile from "./pages/ProProfile";
import NotFound from "./pages/NotFound";
import ImageOrganizer from "./pages/ImageOrganizer";
import CalacattaCollection from "./pages/CalacattaCollection";
import FlooringVisualizer from "./pages/FlooringVisualizer";
import DoormarkCollection from "./pages/DoormarkCollection";
import CabinetVisualizer from "./pages/CabinetVisualizer";
import InstallProjectsDashboard from "./pages/InstallProjectsDashboard";
import InstallerPortal from "./pages/InstallerPortal";
import InstallerProjectDetail from "./pages/InstallerProjectDetail";
import { ShippingLayout } from "./layouts/ShippingLayout";
import Dashboard from "./pages/shipping/Dashboard";
import ShipNow from "./pages/shipping/ShipNow";
import TrackPackage from "./pages/shipping/TrackPackage";
import PackageDetail from "./pages/shipping/PackageDetail";
import Fleet from "./pages/shipping/Fleet";
import Policies from "./pages/shipping/Policies";
import ReturnPolicy from "./pages/shipping/policies/ReturnPolicy";
import ShippingProcedures from "./pages/shipping/policies/ShippingProcedures";
import Contact from "./pages/shipping/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/design-import" element={<DesignImport />} />
          <Route path="/design/:id" element={<DesignViewer />} />
          <Route path="/launch-plan" element={<LaunchPlan />} />
          <Route path="/investor-deck" element={<InvestorDeck />} />
          <Route path="/presentations" element={<Presentations />} />
          <Route path="/power3-installs-plan" element={<Power3InstallsPlan />} />
          <Route path="/online-shop" element={<OnlineShop />} />
          <Route path="/product-manager" element={<ProductManager />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<ProProfile />} />
          <Route path="/image-organizer" element={<ImageOrganizer />} />
          <Route path="/collections/calacatta" element={<CalacattaCollection />} />
          <Route path="/flooring-visualizer" element={<FlooringVisualizer />} />
          <Route path="/collections/doormark" element={<DoormarkCollection />} />
          <Route path="/cabinet-visualizer" element={<CabinetVisualizer />} />
          <Route path="/installs/dashboard" element={<InstallProjectsDashboard />} />
          
          {/* Installer Portal */}
          <Route path="/installer" element={<InstallerPortal />} />
          <Route path="/installer/project/:projectId" element={<InstallerProjectDetail />} />
          
          {/* CW Express Shipping Platform */}
          <Route path="/shipping" element={<ShippingLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="ship" element={<ShipNow />} />
            <Route path="track" element={<TrackPackage />} />
            <Route path="track/:trackingNumber" element={<PackageDetail />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="policies" element={<Policies />} />
            <Route path="policies/returns" element={<ReturnPolicy />} />
            <Route path="policies/shipping" element={<ShippingProcedures />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
