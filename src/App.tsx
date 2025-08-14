import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import SidebarLayout from "@/components/Layout/SidebarLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Pages
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Walkers from "@/pages/Walkers";
import WalkerProfile from "@/pages/WalkerProfile";
import Pets from "@/pages/Pets";
import Schedule from "@/pages/Schedule";
import Settings from "@/pages/Settings";
import BookingNew from "@/pages/BookingNew";
import WalkTracking from "@/pages/WalkTracking";
import Photos from "@/pages/Photos";
import Loyalty from "@/pages/Loyalty";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner 
            position="top-center" 
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-fun)',
              }
            }}
          />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Protected Routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/walkers"
                  element={
                    <ProtectedRoute>
                      <Walkers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/walkers/:walkerId"
                  element={
                    <ProtectedRoute>
                      <WalkerProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pets"
                  element={
                    <ProtectedRoute>
                      <Pets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute>
                      <Schedule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/new"
                  element={
                    <ProtectedRoute>
                      <BookingNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/walk/:id/track"
                  element={
                    <ProtectedRoute>
                      <WalkTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/photos"
                  element={
                    <ProtectedRoute>
                      <Photos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loyalty"
                  element={
                    <ProtectedRoute>
                      <Loyalty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;