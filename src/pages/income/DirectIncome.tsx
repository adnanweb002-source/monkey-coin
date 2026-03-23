import { useState, useEffect } from "react";
import { ArrowDownLeft, ChevronLeft, ChevronRight, RefreshCw, Coins } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Transaction { id: number; txNumber: string; type: string; direction: "CREDIT" | "DEBIT"; amount: string; purpose: string; balanceAfter: string; createdAt: string; }
interface IncomeResponse { total: string; count: number; transactions: Transaction[]; }
const TAKE = 20;

const DailyIncome = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState("0");
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<IncomeResponse>("/wallet/income/direct", { params: { skip, take: TAKE } });
      setTransactions(response.data?.transactions || []); setTotal(response.data?.total || "0"); setCount(response.data?.count || 0);
    } catch (error: any) { toast({ title: t("common.error"), description: error?.response?.data?.message || "Failed to fetch direct income", variant: "destructive" }); setTransactions([]); setTotal("0"); setCount(0); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [skip]);
  const handleRefresh = () => { setSkip(0); fetchData(); };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const currentPage = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.ceil(count / TAKE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("income.dailyIncome")}</h1>
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center"><Coins className="h-6 w-6 text-blue-500" /></div>
            <div><p className="text-sm text-muted-foreground">{t("income.totalDailyEarned")}</p><p className="text-3xl font-bold text-foreground">${parseFloat(total).toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t("income.dailyTransactions")}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />{t("common.refresh")}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (<div className="space-y-4">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12"><Coins className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">{t("income.noDailyRecords")}</p><p className="text-sm text-muted-foreground/70 mt-1">{t("income.dailyAppearHere")}</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>{t("income.date")}</TableHead><TableHead>{t("income.txNumber")}</TableHead><TableHead className="text-right">{t("income.amount")}</TableHead><TableHead>{t("income.purpose")}</TableHead><TableHead className="text-right">{t("income.balanceAfter")}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">{tx.txNumber}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30"><ArrowDownLeft className="h-3 w-3 mr-1" />{t("income.credit")}</Badge><span className="font-medium text-green-500">+${parseFloat(tx.amount).toLocaleString()}</span></div></TableCell>
                        <TableCell className="max-w-[200px] truncate" title={tx.purpose}>{tx.purpose || "-"}</TableCell>
                        <TableCell className="text-right">${parseFloat(tx.balanceAfter).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{t("common.showing")} {skip + 1}-{Math.min(skip + TAKE, count)} {t("common.of")} {count} {t("common.transactions")}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSkip(Math.max(0, skip - TAKE))} disabled={skip === 0}><ChevronLeft className="h-4 w-4 mr-1" />{t("common.previous")}</Button>
                    <span className="text-sm text-muted-foreground px-2">{t("common.page")} {currentPage} {t("common.of")} {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setSkip(skip + TAKE)} disabled={skip + TAKE >= count}>{t("common.next")}<ChevronRight className="h-4 w-4 ml-1" /></Button>
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

export default DailyIncome;
