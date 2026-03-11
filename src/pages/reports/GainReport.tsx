import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  RotateCcw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
} from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { useSearchParams } from "react-router-dom";

interface BreakdownItem {
  type: string;
  amount: string;
}

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

interface GainReportData {
  total: string;
  breakdown?: BreakdownItem[];
  transactions: Transaction[];
}

const incomeTypeLabels: Record<string, string> = {
  BINARY_INCOME: "Binary Income",
  ROI_CREDIT: "ROI / Direct Income",
  BONUS: "Bonus",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  TRANSFER: "Transfer",
};

const incomeTypeColors: Record<string, string> = {
  BINARY_INCOME: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ROI_CREDIT: "bg-green-500/20 text-green-400 border-green-500/30",
  BONUS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DEPOSIT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  WITHDRAWAL: "bg-red-500/20 text-red-400 border-red-500/30",
  TRANSFER: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const TAKE = 20;

const GainReport = () => {
  const [fromDate, setFromDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<GainReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState("0");
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get("type") || "DAILY";

  const fetchGainReport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Error",
        description: "Please select both From and To dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast({
        title: "Error",
        description: "From date cannot be after To date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    let gainType: string;

    if (type === "DAILY") {
      gainType = "ROI_CREDIT";
    } else if (type === "REFERRAL") {
      gainType = "REFERRAL_INCOME";
    } else if (type === "BINARY") {
      gainType = "BINARY_INCOME";
    } else if (type === "PACKAGE_PURCHASE") {
      gainType = "PACKAGE_PURCHASE";
    } else {
      toast({
        title: "Error",
        description: "Invalid report type",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(
        `/wallet/income/gain-report?type=${gainType}&from=${fromDate}&to=${toDate}&skip=${skip}&take=${TAKE}`,
      );
      setData(response.data);
      setTotal(response.data?.total || "0");
      setCount(response.data?.count || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch gain report",
        variant: "destructive",
      });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    setToDate(format(new Date(), "yyyy-MM-dd"));
    setData(null);
    setHasSearched(false);
  };

  const setDatePreset = (preset: "today" | "week" | "month") => {
    const today = new Date();
    switch (preset) {
      case "today":
        setFromDate(format(today, "yyyy-MM-dd"));
        setToDate(format(today, "yyyy-MM-dd"));
        break;
      case "week":
        setFromDate(format(subDays(today, 7), "yyyy-MM-dd"));
        setToDate(format(today, "yyyy-MM-dd"));
        break;
      case "month":
        setFromDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setToDate(format(today, "yyyy-MM-dd"));
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (value: string) => {
    return `$ ${value}`;
  };

  const getMaxAmount = () => {
    if (!data?.breakdown?.length) return 0;
    return Math.max(...data.breakdown.map((item) => parseFloat(item.amount)));
  };

  useEffect(() => {
    setDatePreset("month");
    fetchGainReport();
  }, [type]);

  const currentPage = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.ceil(count / TAKE);

  useEffect(() => {
    fetchGainReport();
  }, [skip]);

  const handleRefresh = () => {
    setSkip(0);
    fetchGainReport();
  };

  console.log(data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground capitalize">
          {type.toLowerCase() == "package_purchase"
            ? "Package"
            : type.charAt(0) + type.slice(1).toLowerCase()}
          {type != "PACKAGE_PURCHASE" ? " Earnings " : " Purchase "}
          Report
        </h1>
        <p className="text-muted-foreground">
          {type === "DAILY"
            ? "View your daily income breakdown"
            : type === "REFERRAL"
              ? "View your referral income breakdown"
              : type === "BINARY"
                ? "View your binary income breakdown"
                : type === "PACKAGE_PURCHASE"
                  ? "View your package purchase breakdown"
                  : ""}
        </p>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Presets */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("today")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("week")}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("month")}
            >
              This Month
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <Button
                onClick={fetchGainReport}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Apply
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <>
          {/* Total Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gain</p>
                  <p className="text-3xl font-bold text-foreground">
                    {data ? formatCurrency(data.total) : formatCurrency("0")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fromDate} to {toDate}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>
                  {type === "DAILY"
                    ? "View your daily income breakdown"
                    : type === "REFERRAL"
                      ? "View your referral income breakdown"
                      : type === "BINARY"
                        ? "View your binary income breakdown"
                        : type === "PACKAGE_PURCHASE"
                          ? "View your package purchase breakdown"
                          : ""}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGainReport}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    No{" "}
                    {type === "DAILY"
                      ? "daily income"
                      : type === "REFERRAL"
                        ? "referral income"
                        : type === "BINARY"
                          ? "binary income"
                          : type === "PACKAGE_PURCHASE"
                            ? "package purchase"
                            : ""}{" "}
                    records yet
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Your transactions will appear here
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Tx Number</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead className="text-right">
                            Balance After
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(tx.createdAt)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {tx.txNumber}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                                  <ArrowDownLeft className="h-3 w-3 mr-1" />
                                  CREDIT
                                </Badge>
                                <span className="font-medium text-green-500">
                                  +${parseFloat(tx.amount).toLocaleString()}
                                </span>
                              </div>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Showing {skip + 1}-{Math.min(skip + TAKE, count)} of{" "}
                        {count} transactions
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
                          disabled={skip + TAKE >= count}
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

          {/* Breakdown Table */}
        </>
      )}

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a date range</p>
              <p className="text-sm">Click "Apply" to view your gain report</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GainReport;
