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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Wallet, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

interface AdminDepositItem {
  id: string;
  userId: number;
  paymentId: string;
  amountFiat: string;
  crypto: string;
  status: string;
  createdAt: string;
}

interface AdminDepositsResponse {
  data: AdminDepositItem[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

interface DepositDetails {
  id: string;
  userId: number;
  paymentId: string;
  amountFiat: string;
  amountCrypto: string;
  crypto: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  waiting: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  confirming: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  finished: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const AdminDeposits = () => {
  const [page, setPage] = useState(1);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading, error } = useQuery<AdminDepositsResponse>({
    queryKey: ["admin-deposits", page, limit],
    queryFn: async () => {
      const response = await api.get(`/admin/deposits?page=${page}&limit=${limit}`);
      return response.data;
    },
  });

  const { data: depositDetails, isLoading: isLoadingDetails } = useQuery<DepositDetails>({
    queryKey: ["admin-deposit-details", selectedDepositId],
    queryFn: async () => {
      const response = await api.get(`/admin/deposits/${selectedDepositId}`);
      return response.data;
    },
    enabled: !!selectedDepositId,
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
        <Wallet className="h-6 w-6" />
        Admin Deposits
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>All Crypto Deposits</CardTitle>
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
              Failed to load deposits
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No deposits found
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Fiat Amount</TableHead>
                      <TableHead>Crypto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.userId}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.paymentId}
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
                        <TableCell>
                          {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDepositId(item.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {data.data.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">User #{item.userId}</p>
                        <p className="font-medium text-lg">
                          ${parseFloat(item.amountFiat).toFixed(2)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[item.status] || ""}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">{item.crypto}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.paymentId.slice(0, 16)}...
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDepositId(item.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={!!selectedDepositId} onOpenChange={() => setSelectedDepositId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Deposit Details
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : depositDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{depositDetails.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={statusColors[depositDetails.status] || ""}
                  >
                    {depositDetails.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fiat Amount</p>
                  <p className="font-medium">${parseFloat(depositDetails.amountFiat).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crypto Amount</p>
                  <p className="font-medium">
                    {depositDetails.amountCrypto} {depositDetails.crypto}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm break-all">{depositDetails.paymentId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-mono text-sm break-all">{depositDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="text-sm">
                    {format(new Date(depositDetails.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires At</p>
                  <p className="text-sm">
                    {format(new Date(depositDetails.expiresAt), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
              </div>

              {depositDetails.metadata && Object.keys(depositDetails.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(depositDetails.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Failed to load deposit details
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeposits;
