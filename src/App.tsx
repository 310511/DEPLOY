import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import HotelDetails from "./pages/HotelDetails";
import Reserve from "./pages/Reserve";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import DestinationDynamic from "./pages/DestinationDynamic";
import Deals from "./pages/Deals";
import NotFound from "./pages/NotFound";
import HotelCodeTester from "./components/HotelCodeTester";
import ApiTest from "./components/ApiTest";
import "./App.css";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/reserve/:id" element={<Reserve />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route
            path="/destination/:destination"
            element={<DestinationDynamic />}
          />
          <Route path="/deals" element={<Deals />} />
          <Route path="/test-hotel-codes" element={<HotelCodeTester />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="*" element={<NotFound />} />
          <Route element={<AppLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
