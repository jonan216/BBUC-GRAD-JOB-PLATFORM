import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterGraduate from "./pages/RegisterGraduate";
import RegisterEmployer from "./pages/RegisterEmployer";
import JobListing from "./pages/JobListing";
import JobDetail from "./pages/JobDetail";
import GraduateDashboard from "./pages/GraduateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GraduateLogin from "./pages/GraduateLogin";
import EmployerLogin from "./pages/EmployerLogin";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/graduate" element={<GraduateLogin />} />
          <Route path="/login/employer" element={<EmployerLogin />} />
          <Route path="/register/graduate" element={<RegisterGraduate />} />
          <Route path="/register/employer" element={<RegisterEmployer />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/dashboard/graduate" element={<GraduateDashboard />} />
          <Route path="/dashboard/employer" element={<EmployerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
