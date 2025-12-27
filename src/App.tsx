import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Signin from "./pages/Signin";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import Success from "./pages/Success";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Deposit from "./pages/wallet/Deposit";
import DepositRequests from "./pages/wallet/DepositRequests";
import Withdraw from "./pages/wallet/Withdraw";
import WithdrawRequests from "./pages/wallet/WithdrawRequests";
import Transactions from "./pages/wallet/Transactions";
import Transfer from "./pages/wallet/Transfer";
import MyTree from "./pages/tree/MyTree";
import HolidayList from "./pages/HolidayList";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Packages from "./pages/Packages";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSupportQueries from "./pages/admin/AdminSupportQueries";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Index />} />
             <Route path="/signup" element={<Index />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            <Route path="/success" element={<Success />} />
            
            {/* Dashboard Routes - wrapped in layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
            </Route>

            {/* Tree Routes - wrapped in layout */}
            <Route path="/tree" element={<DashboardLayout />}>
              <Route index element={<MyTree />} />
            </Route>

            {/* Packages Route */}
            <Route path="/packages" element={<DashboardLayout />}>
              <Route index element={<Packages />} />
            </Route>

            {/* Profile Route */}
            <Route path="/profile" element={<DashboardLayout />}>
              <Route index element={<Profile />} />
            </Route>

            {/* Wallet Routes - wrapped in layout */}
            <Route path="/wallet" element={<DashboardLayout />}>
              <Route path="deposit" element={<Deposit />} />
              <Route path="deposit-requests" element={<DepositRequests />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="withdraw-requests" element={<WithdrawRequests />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transfer" element={<Transfer />} />
            </Route>

            {/* Reports Routes */}
            <Route path="/reports" element={<DashboardLayout />}>
              <Route path="holiday-list" element={<HolidayList />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route path="users" element={<AdminUsers />} />
              <Route path="support/queries" element={<AdminSupportQueries />} />
            </Route>

            {/* Support Route */}
            <Route path="/support" element={<DashboardLayout />}>
              <Route index element={<Support />} />
            </Route>

            {/* Legal Pages */}
            <Route path="/privacy" element={<DashboardLayout />}>
              <Route index element={<PrivacyPolicy />} />
            </Route>
            <Route path="/terms" element={<DashboardLayout />}>
              <Route index element={<TermsAndConditions />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
