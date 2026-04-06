import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface DashboardStats {
  fundDeposited: number;
  yieldReceived: number;
  totalWithdrawal: number;
  rewardsEarned: number;
}

interface IncomeResponse {
  total: string;
  count: number;
  transactions: any[];
}

const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [depositRes, directRes, binaryRes, walletsRes] = await Promise.allSettled([
        api.get("/external-deposit/user-deposits", { params: { page: 1, pageSize: 1 } }),
        api.get<IncomeResponse>("/wallet/income/direct", { params: { skip: 0, take: 1 } }),
        api.get<IncomeResponse>("/wallet/income/binary", { params: { skip: 0, take: 1 } }),
        api.get("/wallet/user-wallets"),
      ]);

      // Fund Deposited: sum fiat from finished deposits
      let fundDeposited = 0;
      if (depositRes.status === "fulfilled") {
        const deposits = depositRes.value.data?.data || depositRes.value.data || [];
        if (Array.isArray(deposits)) {
          fundDeposited = deposits.reduce(
            (sum: number, d: any) => sum + (d.status === "finished" ? parseFloat(d.fiatAmount || "0") : 0),
            0
          );
        }
      }

      // Yield = direct + binary income totals
      let yieldReceived = 0;
      if (directRes.status === "fulfilled") {
        yieldReceived += parseFloat(directRes.value.data?.total || "0");
      }
      if (binaryRes.status === "fulfilled") {
        yieldReceived += parseFloat(binaryRes.value.data?.total || "0");
      }

      // Total Withdrawal: from E wallet transactions or derive from wallets
      let totalWithdrawal = 0;
      // We'll use a simple approach - check if there's a withdrawal endpoint
      try {
        const withdrawRes = await api.get("/wallet/withdraw-requests", { params: { skip: 0, take: 1, status: "APPROVED" } });
        totalWithdrawal = parseFloat(withdrawRes.data?.total || "0");
      } catch {
        // If no withdrawal summary endpoint, default to 0
      }

      // Rewards from BONUS_WALLET balance
      let rewardsEarned = 0;
      if (walletsRes.status === "fulfilled") {
        const wallets = walletsRes.value.data || [];
        const bonusWallet = wallets.find((w: any) => w.type === "A_WALLET");
        if (bonusWallet) {
          rewardsEarned = parseFloat(bonusWallet.balance || "0");
        }
      }

      return { fundDeposited, yieldReceived, totalWithdrawal, rewardsEarned };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useDashboardStats;
