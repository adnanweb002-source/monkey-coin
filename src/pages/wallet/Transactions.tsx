import { useState, useEffect } from "react";
import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiWallet } from "@/types/wallet";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

type WalletType = "D_WALLET" | "P_WALLET" | "E_WALLET" | "A_WALLET";

interface Transaction {
  id: number;
  walletId?: number;
  userId?: number;
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
  D_WALLET: "D Wallet",
  P_WALLET: "P Wallet",
  E_WALLET: "E Wallet",
  A_WALLET: "A Wallet",
};

const reverseWalletLabels: Record<string, WalletType> = {
  "D Wallet": "D_WALLET",
  "P Wallet": "P_WALLET",
  "E Wallet": "E_WALLET",
  "A Wallet": "A_WALLET",
};

const Transactions = () => {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType | "">(
    "",
  );
  const [transactions, setTransactions] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filters, setFilters] = useState<{
    direction?: "CREDIT" | "DEBIT";
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    sortBy?: "createdAt" | "amount";
    sortOrder?: "asc" | "desc";
  }>({});
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = localStorage.getItem("userProfile")
    ? JSON.parse(localStorage.getItem("userProfile") || "").role
    : "USER";

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await api.get("/wallet/user-wallets");
        setWallets(response.data || []);
      } catch (error: any) {
        toast({
          title: t("common.error"),
          description: error?.response?.data?.message || t("reports.wallets"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };
    fetchWallets();
  }, []);

  type MetaViewerProps = { data: any };
  function MetaViewer({ data }: MetaViewerProps) {
    if (!data) return null;
    return (
      <div className="space-y-1 text-xs">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="pl-2">
            <div className="flex gap-2">
              <span className="text-muted-foreground font-medium">
                {key.toLocaleUpperCase()}:
              </span>
              {typeof value === "object" && value !== null ? (
                <div className="border-l pl-3 ml-1">
                  <MetaViewer data={value} />
                </div>
              ) : (
                <span className="break-all">{String(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    if (!selectedWalletType) return;
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const response = await api.post<TransactionsResponse>(
          "/wallet/transactions",
          {
            data: {
              walletType: selectedWalletType,
              skip,
              take: TAKE,
              filters: {
                ...filters,
                minAmount: filters.minAmount
                  ? Number(filters.minAmount)
                  : undefined,
                maxAmount: filters.maxAmount
                  ? Number(filters.maxAmount)
                  : undefined,
                startDate: filters.startDate
                  ? new Date(filters.startDate)
                  : undefined,
                endDate: filters.endDate
                  ? new Date(filters.endDate)
                  : undefined,
              },
            },
          },
        );
        setTransactions(response.data || []);
        setTotal(response.data?.total || 0);
      } catch (error: any) {
        toast({
          title: t("common.error"),
          description:
            error?.response?.data?.message || t("wallet.noTransactions"),
          variant: "destructive",
        });
        setTransactions([]);
        setTotal(0);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [selectedWalletType, skip, filters]);

  const handleWalletChange = (value: string) => {
    const walletType = reverseWalletLabels[value];
    setSelectedWalletType(walletType as WalletType);
    setSearchParams({ walletType: value });
    setSkip(0);
    setExpandedRow(null);
  };

  const handleRefresh = () => {
    if (selectedWalletType) {
      setSkip(0);
      const currentType = selectedWalletType;
      setSelectedWalletType("");
      setTimeout(() => setSelectedWalletType(currentType), 0);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const currentPage = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.ceil(total / TAKE);

  useEffect(() => {
    const walletTypeFromParams = searchParams.get("walletType") as WalletType;
    if (walletTypeFromParams) {
      setSelectedWalletType(
        reverseWalletLabels[walletTypeFromParams] || walletTypeFromParams,
      );
    }
  }, [searchParams]);

  const getDirectionBadge = (direction: string) => {
    if (direction === "CREDIT") {
      return (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
          <ArrowDownLeft className="h-3 w-3 mr-1" />
          {t("income.credit")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        {t("income.debit")}
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
      <h1 className="text-2xl font-bold text-foreground">
        {t("wallet.walletTransactions")}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t("wallet.transactionHistory")}</CardTitle>
            <div className="flex items-center gap-2">
              {isLoadingWallets ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <Select
                  value={selectedWalletType}
                  onValueChange={handleWalletChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("wallet.selectWallet")} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.type}>
                        {walletLabels[wallet.type as WalletType] || wallet.type}{" "}
                        - ${parseFloat(wallet.balance).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-80 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Filters</p>

                    {/* Direction */}
                    <Select
                      value={filters.direction || ""}
                      onValueChange={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          direction: val as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREDIT">Credit</SelectItem>
                        <SelectItem value="DEBIT">Debit</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Date Range */}
                    <Input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />

                    {/* Amount Range */}
                    <Input
                      placeholder="Min Amount"
                      type="number"
                      value={filters.minAmount || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minAmount: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Max Amount"
                      type="number"
                      value={filters.maxAmount || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxAmount: e.target.value,
                        }))
                      }
                    />

                    {/* Sorting */}
                    <Select
                      value={filters.sortBy || ""}
                      onValueChange={(val) =>
                        setFilters((prev) => ({ ...prev, sortBy: val as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.sortOrder || ""}
                      onValueChange={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          sortOrder: val as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSkip(0);
                        // triggers useEffect
                      }}
                    >
                      Apply
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setFilters({});
                        setSkip(0);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoadingTransactions || !selectedWalletType}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingTransactions ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
          {selectedWallet && (
            <p className="text-sm text-muted-foreground">
              {t("wallet.currentBalance")}: $
              {parseFloat(selectedWallet.balance).toLocaleString()}
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
              <p className="text-muted-foreground">
                {t("wallet.noTransactions")}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {selectedWalletType
                  ? t("wallet.noTransactionHistory")
                  : t("wallet.selectWalletToView")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("wallet.id")}</TableHead>
                      <TableHead>{t("wallet.txNumber")}</TableHead>
                      {role === "ADMIN" && (
                        <TableHead>{t("wallet.userId")}</TableHead>
                      )}
                      {role === "ADMIN" && (
                        <TableHead>{t("wallet.walletId")}</TableHead>
                      )}
                      <TableHead>{t("common.type")}</TableHead>
                      <TableHead>{t("wallet.direction")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.amount")}
                      </TableHead>
                      <TableHead>{t("wallet.purpose")}</TableHead>
                      <TableHead className="text-right">
                        {t("wallet.balanceAfter")}
                      </TableHead>
                      <TableHead>{t("wallet.createdAt")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <React.Fragment key={tx.id}>
                        <TableRow
                          className={`cursor-pointer hover:bg-muted/50 ${tx.meta ? "cursor-pointer" : ""}`}
                          onClick={() =>
                            tx.meta &&
                            setExpandedRow(expandedRow === tx.id ? null : tx.id)
                          }
                        >
                          <TableCell className="font-mono text-sm">
                            {tx.id}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {tx.txNumber}
                          </TableCell>
                          {role === "ADMIN" && (
                            <TableCell className="font-mono text-sm">
                              {tx.userId || "-"}
                            </TableCell>
                          )}
                          {role === "ADMIN" && (
                            <TableCell className="font-mono text-sm">
                              {tx.walletId || "-"}
                            </TableCell>
                          )}
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell>
                            {getDirectionBadge(tx.direction)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${parseFloat(tx.amount).toLocaleString()}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={tx.purpose}
                          >
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
                            <TableCell
                              colSpan={role === "ADMIN" ? 10 : 8}
                              className="bg-muted/30"
                            >
                              <div className="p-3">
                                <p className="text-sm font-medium mb-2">
                                  {t("wallet.moreInformation")}:
                                </p>
                                <div className="bg-background rounded p-2">
                                  <MetaViewer data={tx.meta} />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t("common.showing")} {skip + 1}-
                    {Math.min(skip + TAKE, total)} {t("common.of")} {total}{" "}
                    {t("common.transactions")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkip(Math.max(0, skip - TAKE))}
                      disabled={skip === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("common.previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {t("common.page")} {currentPage} {t("common.of")}{" "}
                      {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkip(skip + TAKE)}
                      disabled={skip + TAKE >= total}
                    >
                      {t("common.next")}
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
