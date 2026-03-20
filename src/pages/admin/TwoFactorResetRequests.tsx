import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ResetRequest {
  id: number;
  email: string;
  memberId: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
  status: "OPEN" | "APPROVED" | "REJECTED";
}

const TwoFactorResetRequests = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedRequest, setSelectedRequest] =
    useState<ResetRequest | null>(null);
  const [actionType, setActionType] = useState<
    "APPROVE" | "REJECT" | null
  >(null);

  // Fetch requests
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["2fa-reset-requests", page],
    queryFn: async () => {
      const res = await api.get(
        `/auth/admin/2fa-reset-requests?page=${page}&limit=${limit}`
      );
      return res.data;
    },
  });

  const requests: ResetRequest[] = data?.data || [];
  const pagination = data?.pagination;

  // Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "APPROVED" | "REJECTED";
    }) => {
      return api.post(`/auth/admin/2fa-reset-requests/${id}/status`, {
        status,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title:
          variables.status === "APPROVED"
            ? "Request approved successfully"
            : "Request rejected successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["2fa-reset-requests"],
      });
      setSelectedRequest(null);
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!selectedRequest || !actionType) return;

    updateMutation.mutate({
      id: selectedRequest.id,
      status: actionType === "APPROVE" ? "APPROVED" : "REJECTED",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="secondary">Open</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load requests. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            2FA Reset Requests
          </h1>
          <p className="text-muted-foreground">
            Manual requests submitted by users
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.id}</TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.memberId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {req.ipAddress}
                  </TableCell>
                  <TableCell>{formatDate(req.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    {req.status === "OPEN" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("APPROVE");
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("REJECT");
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
            No requests found
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-card rounded-lg border border-border p-4 space-y-3"
            >
              <div className="space-y-1">
                <p className="font-semibold">{req.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member ID: {req.memberId}
                </p>
                <p className="text-xs font-mono">{req.ipAddress}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(req.createdAt)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(req.status)}
              </div>

              {req.status === "OPEN" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(req);
                      setActionType("APPROVE");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedRequest(req);
                      setActionType("REJECT");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedRequest && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "APPROVE"
                ? "Approve 2FA Reset?"
                : "Reject Request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "APPROVE"
                ? "This will disable the user's current 2FA."
                : "This request will be marked as rejected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={updateMutation.isPending}
              className={
                actionType === "APPROVE"
                  ? ""
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {actionType === "APPROVE" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TwoFactorResetRequests;