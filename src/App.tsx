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
import MyTree from "./pages/tree/MyTree";
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

            {/* Wallet Routes - wrapped in layout */}
            <Route path="/wallet" element={<DashboardLayout />}>
              <Route path="deposit" element={<Deposit />} />
              <Route path="deposit-requests" element={<DepositRequests />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="withdraw-requests" element={<WithdrawRequests />} />
              <Route path="transactions" element={<Transactions />} />
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
