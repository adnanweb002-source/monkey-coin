import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface DepositRequest {
  id: number;
  amount: string;
  method: string;
  reference: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
}

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  APPROVED: "bg-green-500/20 text-green-500 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-500 border-red-500/30",
};

const DepositRequests = () => {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/wallet/deposit-requests", {
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });

      setRequests(response.data?.data || response.data || []);
      setTotal(response.data?.total || response.data?.length || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to fetch deposit requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Deposit Requests</h1>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Deposit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">
                No deposit requests found
              </p>
              <p className="text-sm text-muted-foreground">
                Your deposit requests will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Approved At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">
                          {request.id.toString().slice(0, 8)}...
                        </TableCell>
                        <TableCell>${parseFloat(request.amount).toLocaleString()}</TableCell>
                        <TableCell>{request.method || "-"}</TableCell>
                        <TableCell>{request.reference || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[request.status]}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {request.approvedAt
                            ? format(new Date(request.approvedAt), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
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

export default DepositRequests;