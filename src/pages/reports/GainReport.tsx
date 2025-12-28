import { useState } from "react";
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
import { TrendingUp, Calendar, RefreshCw, RotateCcw, DollarSign } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";

interface BreakdownItem {
  type: string;
  amount: string;
}

interface GainReportData {
  total: string;
  breakdown: BreakdownItem[];
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

const GainReport = () => {
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<GainReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

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

    try {
      const response = await api.get(`/wallet/income/gain-report?from=${fromDate}&to=${toDate}`);
      setData(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch gain report",
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

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getMaxAmount = () => {
    if (!data?.breakdown?.length) return 0;
    return Math.max(...data.breakdown.map((item) => parseFloat(item.amount)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Gain Report</h1>
        <p className="text-muted-foreground">
          View your income breakdown across different sources
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
              <Button onClick={fetchGainReport} disabled={isLoading} className="flex-1">
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

          {/* Breakdown Table */}
          {data?.breakdown && data.breakdown.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={18} />
                  Income Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-1/3">Distribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.breakdown.map((item, index) => {
                        const amount = parseFloat(item.amount);
                        const maxAmount = getMaxAmount();
                        const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={incomeTypeColors[item.type] || ""}
                              >
                                {incomeTypeLabels[item.type] || item.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {data.breakdown.map((item, index) => {
                    const amount = parseFloat(item.amount);
                    const maxAmount = getMaxAmount();
                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border bg-card/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Badge
                            variant="outline"
                            className={incomeTypeColors[item.type] || ""}
                          >
                            {incomeTypeLabels[item.type] || item.type}
                          </Badge>
                          <span className="font-bold text-foreground">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No income records found</p>
                  <p className="text-sm">Try adjusting your date range</p>
                </div>
              </CardContent>
            </Card>
          )}
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
