import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiWallet } from "@/types/wallet";

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
  meta?: Record<string, unknown>;
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
}

const TAKE = 20;

const walletLabels: Record<WalletType, string> = {
  F_WALLET: "F Wallet",
  I_WALLET: "I Wallet",
  M_WALLET: "M Wallet",
  BONUS_WALLET: "Bonus Wallet",
};

const Transactions = () => {
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType | "">("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch wallets on mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await api.get("/wallet/user-wallets");
        const walletData = response.data || [];
        setWallets(walletData);
        // Default to first wallet
        if (walletData.length > 0 && !selectedWalletType) {
          setSelectedWalletType(walletData[0].type);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to fetch wallets",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };

    fetchWallets();
  }, []);

  // Fetch transactions when wallet changes or pagination changes
  useEffect(() => {
    if (!selectedWalletType) return;

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const response = await api.get<TransactionsResponse>("/transactions", {
          params: {
            walletType: selectedWalletType,
            skip,
            take: TAKE,
          },
        });
        setTransactions(response.data?.data || []);
        setTotal(response.data?.total || 0);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to fetch transactions",
          variant: "destructive",
        });
        setTransactions([]);
        setTotal(0);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [selectedWalletType, skip]);

  const handleWalletChange = (value: string) => {
    setSelectedWalletType(value as WalletType);
    setSkip(0); // Reset pagination
    setExpandedRow(null);
  };

  const handleRefresh = () => {
    if (selectedWalletType) {
      setSkip(0);
      // Trigger re-fetch by forcing effect
      const currentType = selectedWalletType;
      setSelectedWalletType("");
      setTimeout(() => setSelectedWalletType(currentType), 0);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const currentPage = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.ceil(total / TAKE);

  const getDirectionBadge = (direction: string) => {
    if (direction === "CREDIT") {
      return (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
          <ArrowDownLeft className="h-3 w-3 mr-1" />
          CREDIT
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        DEBIT
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      DEPOSIT: "bg-blue-500/20 text-blue-500",
      WITHDRAW: "bg-orange-500/20 text-orange-500",
      TRANSFER: "bg-purple-500/20 text-purple-500",
    };
    return (
      <Badge className={colors[type] || "bg-secondary text-foreground"}>
        {type}
      </Badge>
    );
  };

  const selectedWallet = wallets.find((w) => w.type === selectedWalletType);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Wallet Transactions</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              {isLoadingWallets ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <Select
                  value={selectedWalletType}
                  onValueChange={handleWalletChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.type}>
                        {walletLabels[wallet.type as WalletType] || wallet.type} - $
                        {parseFloat(wallet.balance).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoadingTransactions || !selectedWalletType}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingTransactions ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {selectedWallet && (
            <p className="text-sm text-muted-foreground">
              Current Balance: ${parseFloat(selectedWallet.balance).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {selectedWalletType
                  ? "This wallet has no transaction history yet"
                  : "Please select a wallet to view transactions"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tx Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <>
                        <TableRow
                          key={tx.id}
                          className={`cursor-pointer hover:bg-muted/50 ${tx.meta ? "cursor-pointer" : ""}`}
                          onClick={() => tx.meta && setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                        >
                          <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                          <TableCell className="font-mono text-sm">{tx.txNumber}</TableCell>
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell>{getDirectionBadge(tx.direction)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${parseFloat(tx.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={tx.purpose}>
                            {tx.purpose || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            ${parseFloat(tx.balanceAfter).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </TableCell>
                        </TableRow>
                        {expandedRow === tx.id && tx.meta && (
                          <TableRow key={`${tx.id}-meta`}>
                            <TableCell colSpan={8} className="bg-muted/30">
                              <div className="p-3">
                                <p className="text-sm font-medium mb-2">Meta Information:</p>
                                <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
                                  {JSON.stringify(tx.meta, null, 2)}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {skip + 1}-{Math.min(skip + TAKE, total)} of {total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkip(Math.max(0, skip - TAKE))}
                      disabled={skip === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkip(skip + TAKE)}
                      disabled={skip + TAKE >= total}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
