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
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { walletConfig } from "@/lib/config";

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
  walletsUsed?: Record<string, number>;
}

interface GainReportData {
  total: string;
  breakdown?: { type: string; amount: string }[];
  transactions: Transaction[];
}

const TAKE = 20;

const GainReport = () => {
  const { t } = useTranslation();
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
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type") || "DAILY";
  const self = searchParams.get("self") || "no";

  const getReportTitle = () => {
    if (type === "PACKAGE_PURCHASE") return t("reports.packagePurchaseReport");
    if (type === "DAILY") return t("reports.dailyEarningsReport");
    if (type === "REFERRAL") return t("reports.referralEarningsReport");
    if (type === "BINARY") return t("reports.binaryEarningsReport");
    return t("reports.gainReport");
  };

  const getReportSubtitle = () => {
    if (type === "DAILY") return t("reports.viewDailyBreakdown");
    if (type === "REFERRAL") return t("reports.viewReferralBreakdown");
    if (type === "BINARY") return t("reports.viewBinaryBreakdown");
    if (type === "PACKAGE_PURCHASE") return t("reports.viewPackageBreakdown");
    return "";
  };

  const fetchGainReport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: t("common.error"),
        description: t("reports.selectDateRange"),
        variant: "destructive",
      });
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast({
        title: t("common.error"),
        description: t("reports.selectDateRange"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    let gainType: string;
    if (type === "DAILY") gainType = "ROI_CREDIT";
    else if (type === "REFERRAL") gainType = "REFERRAL_INCOME";
    else if (type === "BINARY") gainType = "BINARY_INCOME";
    else if (type === "PACKAGE_PURCHASE") gainType = "PACKAGE_PURCHASE";
    else {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(
        `/wallet/income/gain-report?type=${gainType}&from=${fromDate}&to=${toDate}&skip=${skip}&take=${TAKE}&self=${self}`,
      );
      setData(response.data);
      setTotal(response.data?.total || "0");
      setCount(response.data?.count || 0);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("reports.gainReport"),
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();
  const formatCurrency = (value: string) => `$ ${value}`;

  useEffect(() => {
    setDatePreset("month");
    fetchGainReport();
  }, [type, self]);

  const currentPage = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.ceil(count / TAKE);

  useEffect(() => {
    fetchGainReport();
  }, [skip]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {getReportTitle()}
        </h1>
        <p className="text-muted-foreground">{getReportSubtitle()}</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} />
            {t("reports.dateRangeFilter")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("today")}
            >
              {t("reports.today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("week")}
            >
              {t("reports.thisWeek")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset("month")}
            >
              {t("reports.thisMonth")}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">{t("reports.fromDate")}</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">{t("reports.toDate")}</Label>
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
                {t("common.apply")}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && hasSearched && (
        <>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("reports.totalAmount")}
                  </p>
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
                <CardTitle>{getReportSubtitle()}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGainReport}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  {t("common.refresh")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data?.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t("reports.noRecordsYet")}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {t("reports.transactionsAppear")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.date")}</TableHead>
                          <TableHead>{t("income.txNumber")}</TableHead>
                          <TableHead className="text-right">
                            {t("common.amount")}
                          </TableHead>
                          <TableHead>{t("income.purpose")}</TableHead>
                          {type != "PACKAGE_PURCHASE" && (
                            <>
                              <TableHead className="text-right">
                                {t("income.balanceAfter")}
                              </TableHead>
                              <TableHead className="text-right">
                                {t("packages.walletSplitAllocation")}
                              </TableHead>
                            </>
                          )}
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
                                  {type === "PACKAGE_PURCHASE" ? (
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                  ) : (
                                    <ArrowDownLeft className="h-3 w-3 mr-1" />
                                  )}
                                  {type === "PACKAGE_PURCHASE"
                                    ? t("income.debit")
                                    : t("income.credit")}
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
                            {
                              type != "PACKAGE_PURCHASE" &&
                              <>
                                <TableCell className="text-right">
                                  ${parseFloat(tx.balanceAfter).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {tx.walletsUsed
                                    ? Object.entries(tx.walletsUsed).map(([wallet, percentage]) => {
                                      const actualAmount = (percentage / 100) * parseFloat(tx.amount);
                                      return (
                                        <div key={wallet}>
                                          {walletConfig?.[wallet]?.label || wallet}: $
                                          {actualAmount.toFixed(2)}
                                        </div>
                                      );
                                    })
                                    : "-"}
                                </TableCell>
                              </>
                            }
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {t("common.showing")} {skip + 1}-
                        {Math.min(skip + TAKE, count)} {t("common.of")} {count}{" "}
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
                          disabled={skip + TAKE >= count}
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
        </>
      )}

      {!isLoading && !hasSearched && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {t("reports.selectDateRange")}
              </p>
              <p className="text-sm">{t("reports.clickApply")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GainReport;
