import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Signin from "./pages/Signin";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import TwoFactorSetup from "./pages/security/TwoFactorSetup";
import Success from "./pages/Success";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Deposit from "./pages/wallet/Deposit";
import DepositRequests from "./pages/wallet/DepositRequests";
import DepositHistory from "./pages/wallet/DepositHistory";
import AdminDeposits from "./pages/admin/AdminDeposits";
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
import SystemPrune from "./pages/admin/SystemPrune";
import PackageWalletRules from "./pages/admin/PackageWalletRules";
import SupportedWalletTypes from "./pages/admin/SupportedWalletTypes";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPackages from "./pages/admin/AdminPackages";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import BinaryIncome from "./pages/income/BinaryIncome";
import ReferralIncome from "./pages/income/ReferralIncome";
import DirectIncome from "./pages/income/DirectIncome";
import Wallets from "./pages/reports/Wallets";
import GainReport from "./pages/reports/GainReport";
import TrackReferral from "./pages/reports/TrackReferral";
import RankReward from "./pages/reports/RankReward";
import RequireAuth from "./components/auth/RequireAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Dashboard Layout with 2FA requirement
const ProtectedDashboard = () => (
  <RequireAuth require2FA={true}>
    <DashboardLayout />
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<ProtectedDashboard />}>
              <Route index element={<DashboardHome />} />
            </Route>

            <Route path="/signup" element={<Index />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            <Route path="/success" element={<Success />} />

            {/* 2FA Setup Route - requires auth but not 2FA */}
            <Route
              path="/security/2fa/setup"
              element={
                <RequireAuth require2FA={false}>
                  <TwoFactorSetup />
                </RequireAuth>
              }
            />

            {/* Dashboard Routes - wrapped in protected layout */}
            <Route path="/dashboard" element={<ProtectedDashboard />}>
              <Route index element={<DashboardHome />} />
            </Route>

            {/* Tree Routes - wrapped in layout */}
            <Route path="/tree" element={<ProtectedDashboard />}>
              <Route index element={<MyTree />} />
            </Route>

            {/* Packages Route */}
            <Route path="/packages" element={<ProtectedDashboard />}>
              <Route index element={<Packages />} />
            </Route>

            {/* Profile Route */}
            <Route path="/profile" element={<ProtectedDashboard />}>
              <Route index element={<Profile />} />
            </Route>

            {/* Wallet Routes - wrapped in layout */}
            <Route path="/wallet" element={<ProtectedDashboard />}>
              <Route path="deposit" element={<Deposit />} />
              <Route path="deposit-requests" element={<DepositRequests />} />
              <Route path="deposit-history" element={<DepositHistory />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="withdraw-requests" element={<WithdrawRequests />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transfer" element={<Transfer />} />
            </Route>

            {/* Income Routes */}
            <Route path="/income" element={<ProtectedDashboard />}>
              <Route path="binary" element={<BinaryIncome />} />
              <Route path="direct" element={<DirectIncome />} />
              <Route path="referral" element={<ReferralIncome />} />
            </Route>

            {/* Reports Routes */}
            <Route path="/reports" element={<ProtectedDashboard />}>
              <Route path="wallets" element={<Wallets />} />
              <Route path="gain-report" element={<GainReport />} />
              <Route path="track-referral" element={<TrackReferral />} />
              <Route path="rank-reward" element={<RankReward />} />
              <Route path="holiday-list" element={<HolidayList />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedDashboard />}>
              <Route path="users" element={<AdminUsers />} />
              <Route path="support/queries" element={<AdminSupportQueries />} />
              <Route path="system/prune" element={<SystemPrune />} />
              <Route
                path="package-wallet-rules"
                element={<PackageWalletRules />}
              />
              <Route
                path="supported-wallet-types"
                element={<SupportedWalletTypes />}
              />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="deposits" element={<AdminDeposits />} />
            </Route>

            {/* Support Route */}
            <Route path="/support" element={<ProtectedDashboard />}>
              <Route index element={<Support />} />
            </Route>

            {/* Legal Pages */}
            <Route path="/privacy" element={<ProtectedDashboard />}>
              <Route index element={<PrivacyPolicy />} />
            </Route>
            <Route path="/terms" element={<ProtectedDashboard />}>
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
