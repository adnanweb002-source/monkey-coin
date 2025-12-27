import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import api from "@/lib/api";

interface AdminDepositActionsProps {
  depositId: number;
  status: string;
  onSuccess: () => void;
}

const AdminDepositActions = ({ depositId, status, onSuccess }: AdminDepositActionsProps) => {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/deposits/${depositId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit approved successfully" });
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve deposit",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/deposits/${depositId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit rejected" });
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["deposit-requests"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject deposit",
        variant: "destructive",
      });
    },
  });

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;
  const isPending = status === "PENDING";

  if (!isPending) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
          onClick={() => setConfirmAction("approve")}
          disabled={isProcessing}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={() => setConfirmAction("reject")}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve"
                ? "Are you sure you want to approve this deposit? The funds will be credited to the user's wallet."
                : "Are you sure you want to reject this deposit? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === "approve") {
                  approveMutation.mutate();
                } else {
                  rejectMutation.mutate();
                }
              }}
              disabled={isProcessing}
              className={confirmAction === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : confirmAction === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminDepositActions;
