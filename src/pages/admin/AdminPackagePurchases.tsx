import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";

interface PurchaseParty {
  id: number;
  memberId: string;
  name: string;
}

interface EWalletPackagePurchase {
  id: number;
  packageId: number;
  packageName: string;
  amount: string;
  eWalletAmount: string;
  purchasedFor: PurchaseParty;
  purchasedBy: PurchaseParty;
  createdAt: string;
  splitConfig: Record<string, number>;
}

interface ListResponse {
  take: number;
  skip: number;
  memberId: string | null;
  pageCount: number;
  totalCount: number;
  data: EWalletPackagePurchase[];
}

const TAKE = 20;

const AdminPackagePurchases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("1");
  const [memberId, setMemberId] = useState("");
  const [debouncedMemberId, setDebouncedMemberId] = useState("");
  const [deletingPurchase, setDeletingPurchase] = useState<EWalletPackagePurchase | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const skip = (page - 1) * TAKE;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMemberId(memberId.trim());
      setPage(1);
      setJumpPage("1");
    }, 400);
    return () => clearTimeout(timer);
  }, [memberId]);

  const { data, isLoading, isError, error, isFetching } = useQuery<ListResponse>({
    queryKey: ["admin-package-purchases-e-wallet", TAKE, skip, debouncedMemberId],
    queryFn: async () => {
      const params = new URLSearchParams({
        take: String(TAKE),
        skip: String(skip),
      });
      if (debouncedMemberId) params.append("memberId", debouncedMemberId);
      const response = await api.get(
        `/admin/package-purchases/with-e-wallet?${params.toString()}`
      );
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: number; reason?: string }) => {
      const response = await api.delete(`/admin/package-purchases/${purchaseId}`, {
        data: { reason: reason?.trim() || undefined },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Package purchase deleted",
        description: "Reversal entries were applied successfully.",
      });
      setDeletingPurchase(null);
      setDeleteReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-package-purchases-e-wallet"] });
    },
    onError: (err) => {
      toast({
        title: "Delete failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });

  const totalCount = data?.totalCount ?? 0;
  const pageCount = data?.pageCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / TAKE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const rows = data?.data ?? [];

  const infoLabel = useMemo(() => {
    if (!data) return "";
    const from = data.pageCount === 0 ? 0 : skip + 1;
    const to = skip + data.pageCount;
    const searchLabel = debouncedMemberId ? ` for Member ID ${debouncedMemberId}` : "";
    return `Showing ${from} to ${to} of ${data.totalCount}${searchLabel}`;
  }, [data, skip, debouncedMemberId]);

  const handleJump = () => {
    const parsed = Number(jumpPage);
    if (!Number.isFinite(parsed) || parsed < 1) {
      toast({
        title: "Invalid page",
        description: "Enter a page number greater than 0.",
        variant: "destructive",
      });
      return;
    }
    const pageNum = Math.floor(parsed);
    if (pageNum > totalPages) {
      toast({
        title: "Invalid page",
        description: `Enter a page between 1 and ${totalPages}.`,
        variant: "destructive",
      });
      return;
    }
    setPage(pageNum);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">E-Wallet Package Purchases</h1>
        <p className="text-muted-foreground">
          Review package purchases where E Wallet was used and delete with reversal if needed.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:max-w-sm">
          <Label htmlFor="member-id-search">Search by Member ID</Label>
          <Input
            id="member-id-search"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Enter exact member ID"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>E Wallet Amount</TableHead>
              <TableHead>Purchased For</TableHead>
              <TableHead>Purchased By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive py-8">
                  {getErrorMessage(error)}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No package purchases with E Wallet found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">#{row.id}</TableCell>
                  <TableCell>{row.packageName}</TableCell>
                  <TableCell>${Number(row.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-primary font-medium">
                    ${Number(row.eWalletAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{row.purchasedFor.memberId}</div>
                      <div className="text-muted-foreground">{row.purchasedFor.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{row.purchasedBy.memberId}</div>
                      <div className="text-muted-foreground">{row.purchasedBy.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingPurchase(row)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {infoLabel} {isFetching ? "(Refreshing...)" : ""}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!hasPrev}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="px-2 text-sm">
            Page {page} of {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <Label htmlFor="jump-page" className="text-sm">
            Jump to
          </Label>
          <Input
            id="jump-page"
            type="number"
            min={1}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-20 h-8"
          />
          <Button variant="secondary" size="sm" onClick={handleJump}>
            Go
          </Button>
        </div>
      </div>

      <AlertDialog
        open={!!deletingPurchase}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPurchase(null);
            setDeleteReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete package purchase #{deletingPurchase?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reverse wallet balances, related referral entries, and remove the purchase
              record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-reason">Reason (optional)</Label>
            <Textarea
              id="delete-reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Add an optional reason for audit trail..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (!deletingPurchase) return;
                deleteMutation.mutate({
                  purchaseId: deletingPurchase.id,
                  reason: deleteReason,
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Purchase"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPackagePurchases;
