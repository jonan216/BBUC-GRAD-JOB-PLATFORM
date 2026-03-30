import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const RegisterGraduate = lazy(() => import("./pages/RegisterGraduate"));
const RegisterEmployer = lazy(() => import("./pages/RegisterEmployer"));
const JobListing = lazy(() => import("./pages/JobListing"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const GraduateDashboard = lazy(() => import("./pages/GraduateDashboard"));
const EmployerDashboard = lazy(() => import("./pages/EmployerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const GraduateLogin = lazy(() => import("./pages/GraduateLogin"));
const EmployerLogin = lazy(() => import("./pages/EmployerLogin"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-emerald-950 animate-pulse">Loading experience...</p>
            </div>
          </div>
        }>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
