import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

interface DepositHistoryItem {
  id: string;
  paymentId: string;
  amountFiat: string;
  crypto: string;
  status: "pending" | "waiting" | "confirming" | "finished" | "failed";
  createdAt: string;
}

interface DepositHistoryResponse {
  data: DepositHistoryItem[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  waiting: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  confirming: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  finished: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const DepositHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery<DepositHistoryResponse>({
    queryKey: ["deposit-history", page, limit],
    queryFn: async () => {
      const response = await api.get(`/wallet/deposit/history?page=${page}&limit=${limit}`);
      return response.data;
    },
  });

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(data.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </PaginationItem>
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                onClick={() => setPage(p)}
                isActive={page === p}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <History className="h-6 w-6" />
        Deposit History
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Crypto Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load deposit history
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No deposit history found
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount (Fiat)</TableHead>
                      <TableHead>Crypto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(item.amountFiat).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.crypto}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[item.status] || ""}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.paymentId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {data.data.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          ${parseFloat(item.amountFiat).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[item.status] || ""}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{item.crypto}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.paymentId.slice(0, 12)}...
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositHistory;
