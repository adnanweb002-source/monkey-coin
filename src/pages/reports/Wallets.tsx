import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Banknote,
  TrendingUp,
  Gift,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiWallet } from "@/types/wallet";
import WalletLimitsManagement from "@/components/admin/WalletLimitsManagement";

type WalletType = "F_WALLET" | "I_WALLET" | "M_WALLET" | "BONUS_WALLET";

interface Transaction {
  id: number;
  txNumber: string;
  type: string;
  direction: "CREDIT" | "DEBIT";
  amount: string;
  purpose: string;
  balanceAfter: string;
  createdAt: string;
}

const walletConfig: Record<
  WalletType,
  { name: string; description: string; icon: React.ElementType; color: string }
> = {
  F_WALLET: {
    name: "Deposit Wallet",
    description: "User deposits for investments",
    icon: Banknote,
    color: "bg-blue-500",
  },
  M_WALLET: {
    name: "ROI / Direct Income Wallet",
    description: "Direct Income and ROI earnings",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  I_WALLET: {
    name: "Binary Income Wallet",
    description: "Binary network income",
    icon: PiggyBank,
    color: "bg-purple-500",
  },
  BONUS_WALLET: {
    name: "Bonus Wallet",
    description: "Admin bonuses and rewards",
    icon: Gift,
    color: "bg-orange-500",
  },
};

const Wallets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Record<WalletType, Transaction | null>>({} as Record<WalletType, Transaction | null>);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role
  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        setIsAdmin(profile?.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get("/wallet/user-wallets");
      return response.data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to fetch wallets",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchLatestTransaction = async (walletType: WalletType): Promise<Transaction | null> => {
    try {
      const response = await api.post("/wallet/transactions", {
        data: {
          walletType,
          skip: 0,
          take: 1,
        },
      });
      const transactions = response.data?.data || response.data || [];
      return Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null;
    } catch {
      return null;
    }
  };

  const loadData = async (showRefreshToast = false) => {
    if (showRefreshToast) setIsRefreshing(true);
    else setIsLoading(true);

    const walletData = await fetchWallets();
    setWallets(walletData);

    // Fetch latest transaction for each wallet in parallel
    const transactionPromises = walletData.map(async (wallet: ApiWallet) => {
      const tx = await fetchLatestTransaction(wallet.type as WalletType);
      return { type: wallet.type as WalletType, tx };
    });

    const results = await Promise.all(transactionPromises);
    const txMap = results.reduce((acc, { type, tx }) => {
      acc[type] = tx;
      return acc;
    }, {} as Record<WalletType, Transaction | null>);

    setLatestTransactions(txMap);
    setIsLoading(false);
    setIsRefreshing(false);

    if (showRefreshToast) {
      toast({ title: "Refreshed", description: "Wallet data updated" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);

  const handleViewTransactions = (walletType: WalletType) => {
    navigate(`/wallet/transactions?walletType=${walletType}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Wallets</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View all your wallets and recent activity
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Total Balance Summary */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Across All Wallets
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {formatCurrency(totalBalance.toString())}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Cards Grid */}
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No wallets found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet) => {
              const config = walletConfig[wallet.type as WalletType];
              const latestTx = latestTransactions[wallet.type as WalletType];
              const IconComponent = config?.icon || Wallet;

              return (
                <Card key={wallet.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${config?.color || "bg-secondary"} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {config?.name || wallet.type}
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="mt-1 cursor-help">
                                {wallet.type}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{config?.description || "Wallet for transactions"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Balance */}
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>

                    <Separator />

                    {/* Latest Transaction */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Most Recent Transaction
                      </p>

                      {latestTx ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {latestTx.direction === "CREDIT" ? (
                                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <ArrowDownLeft className="h-3 w-3 text-green-500" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                  <ArrowUpRight className="h-3 w-3 text-red-500" />
                                </div>
                              )}
                              <span className={`font-semibold ${latestTx.direction === "CREDIT" ? "text-green-500" : "text-red-500"}`}>
                                {latestTx.direction === "CREDIT" ? "+" : "-"}
                                {formatCurrency(latestTx.amount)}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {latestTx.type}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p className="truncate">
                              {latestTx.purpose || "No purpose specified"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(latestTx.createdAt)}</span>
                            <span className="font-mono">{latestTx.txNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-secondary/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            No transactions yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewTransactions(wallet.type as WalletType)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Transactions
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Admin-only Wallet Limits Section */}
        {isAdmin && (
          <div className="mt-8">
            <WalletLimitsManagement />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Wallets;
