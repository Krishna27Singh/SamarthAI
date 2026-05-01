import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import CommandCenter from "./pages/CommandCenter";
import DataIngestion from "./pages/DataIngestion";
import VolunteerAnalytics from "./pages/VolunteerAnalytics";
import FieldApp from "./pages/FieldApp";
import ProfileView from "./pages/ProfileView";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />

            <Route path="/dashboard" element={<ProtectedRoute allowedRole="NGO"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<CommandCenter />} />
              <Route path="command" element={<CommandCenter />} />
              <Route path="ingestion" element={<DataIngestion />} />
              <Route path="analytics" element={<VolunteerAnalytics />} />
              <Route path="field" element={<Navigate to="/field-app" replace />} />
            </Route>

            <Route
              path="/field-app"
              element={
                <ProtectedRoute allowedRole="Volunteer">
                  <FieldApp />
                </ProtectedRoute>
              }
            />

            <Route
              path="/field/profile"
              element={
                <ProtectedRoute allowedRole="Volunteer">
                  <ProfileView />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
