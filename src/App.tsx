import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminThemeProvider } from "@/admin/ThemeProvider";
import AdminLayout from "@/admin/AdminLayout";
import {
  AdminDashboard,
  AdminSiteSettings,
  AdminMedia,
  AdminBookings,
  AdminCRM,
  AdminMemberDetail,
  AdminTaskBoard,
  AdminCalendar,
  AdminPush,
} from "@/admin/pages";
import {
  Index,
  About,
  Method,
  Stories,
  Resources,
  Booking,
  Privacy,
  Quiz,
  NotFound,
} from "./pages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AdminThemeProvider>
        <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/method" element={<Method />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminSiteSettings />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="crm" element={<AdminCRM />} />
                  <Route path="crm/:memberId" element={<AdminMemberDetail />} />
                  <Route path="tasks" element={<AdminTaskBoard />} />
                  <Route path="calendar" element={<AdminCalendar />} />
                  <Route path="push" element={<AdminPush />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
        </TooltipProvider>
      </AdminThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
