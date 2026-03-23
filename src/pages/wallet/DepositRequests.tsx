import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import AdminDepositActions from "@/components/admin/AdminDepositActions";

interface DepositRequest { id: number; amount: string; method: string; reference: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: string; approvedAt: string | null; }

const PAGE_SIZE = 20;
const statusColors: Record<string, string> = { PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", APPROVED: "bg-green-500/20 text-green-500 border-green-500/30", REJECTED: "bg-red-500/20 text-red-500 border-red-500/30" };

const DepositRequests = () => {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => { const stored = localStorage.getItem("userProfile"); if (stored) { const profile = JSON.parse(stored); setIsAdmin(profile?.role === "ADMIN"); } }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/wallet/deposit-requests", { skip: page * PAGE_SIZE, take: PAGE_SIZE, ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}) });
      setRequests(response.data?.data || response.data || []);
      setTotal(response.data?.total || response.data?.length || 0);
    } catch (error: any) { toast({ title: t("common.error"), description: error?.response?.data?.message || "Failed to fetch deposit requests", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [page, statusFilter]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("wallet.depositRequests")}</h1>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("wallet.filterStatus")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.all")}</SelectItem>
            <SelectItem value="PENDING">{t("common.pending")}</SelectItem>
            <SelectItem value="APPROVED">{t("common.approved")}</SelectItem>
            <SelectItem value="REJECTED">{t("common.rejected")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>{isAdmin ? t("wallet.allDepositRequests") : t("wallet.yourDepositRequests")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (<div className="space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">{t("wallet.noDepositRequests")}</p>
              <p className="text-sm text-muted-foreground">{t("wallet.depositRequestsAppear")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("wallet.id")}</TableHead>
                      <TableHead>{t("common.amount")}</TableHead>
                      <TableHead>{t("wallet.method")}</TableHead>
                      <TableHead>{t("wallet.reference")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("wallet.createdAt")}</TableHead>
                      <TableHead>{t("wallet.approvedAt")}</TableHead>
                      {isAdmin && <TableHead>{t("common.actions")}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id.toString().slice(0, 8)}...</TableCell>
                        <TableCell>${parseFloat(request.amount).toLocaleString()}</TableCell>
                        <TableCell>{request.method || "-"}</TableCell>
                        <TableCell>{request.reference || "-"}</TableCell>
                        <TableCell><Badge variant="outline" className={statusColors[request.status]}>{request.status}</Badge></TableCell>
                        <TableCell>{format(new Date(request.createdAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{request.approvedAt ? format(new Date(request.approvedAt), "MMM dd, yyyy") : "-"}</TableCell>
                        {isAdmin && (<TableCell><AdminDepositActions depositId={request.id} status={request.status} onSuccess={fetchRequests} /></TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">{t("common.page")} {page + 1} {t("common.of")} {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
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

export default DepositRequests;
