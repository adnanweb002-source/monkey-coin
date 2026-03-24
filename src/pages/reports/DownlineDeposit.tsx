import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDownToLine, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ExternalDeposit } from "@/types/deposit";
import { Coins } from "lucide-react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

const DownlineDeposit = () => {
  const { t } = useTranslation();
  const [deposits, setDeposits] = useState<ExternalDeposit[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setIsLoadingMore(true); else setIsLoading(true);
    try {
      const res = await api.get("/tree/downline/deposit-funds", { params: { page: pageNum, pageSize: PAGE_SIZE } });
      const data = res.data?.data || [];
      setDeposits(prev => append ? [...prev, ...data] : data);
      setTotal(res.data?.total || 0);
      setPage(pageNum);
    } catch (error: any) {
      toast({ title: t("common.error"), description: error?.response?.data?.message || t("reports.noDownlineDeposits"), variant: "destructive" });
    } finally { setIsLoading(false); setIsLoadingMore(false); }
  }, [toast, t]);

  useEffect(() => { fetchData(1, false); }, [fetchData]);

  const hasMore = deposits.length < total;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingMore && !isLoading) fetchData(page + 1, true);
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, fetchData]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("reports.downlineDepositFund")}</h1>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Coins className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.totalDownlineDeposit")}</p>
              <p className="text-3xl font-bold text-foreground">${parseFloat(total.toString()).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t("reports.depositRecords")}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => fetchData(1, false)} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />{t("common.refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownToLine className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("reports.noDownlineDeposits")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("wallet.paymentId")}</TableHead>
                      <TableHead>{t("reports.memberIdCol")}</TableHead>
                      <TableHead className="text-right">{t("reports.fiatAmount")}</TableHead>
                      <TableHead>{t("wallet.crypto")}</TableHead>
                      <TableHead className="text-right">{t("reports.amountPaid")}</TableHead>
                      <TableHead className="text-right">{t("reports.usdt")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-sm">{d.paymentId}</TableCell>
                        <TableCell className="text-sm">{d.user?.memberId || "-"}</TableCell>
                        <TableCell className="text-right font-medium">${d.fiatAmount}</TableCell>
                        <TableCell className="text-sm">{d.crypto}</TableCell>
                        <TableCell className="text-right text-sm">{d.paidAmount || "-"}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">-</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(d.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-4">
                  {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {t("common.showing")} {deposits.length} {t("common.of")} {total} {t("common.records")}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownlineDeposit;
