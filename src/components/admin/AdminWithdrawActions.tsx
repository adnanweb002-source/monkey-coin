import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface AdminWithdrawActionsProps {
  withdrawId: number;
  status: string;
  onSuccess: () => void;
}

const AdminWithdrawActions = ({ withdrawId, status, onSuccess }: AdminWithdrawActionsProps) => {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await api.post(`/admin/withdrawal/${withdrawId}/approve`, { adminNote: note });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal approved successfully" });
      setConfirmAction(null);
      setAdminNote("");
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await api.post(`/admin/withdrawal/${withdrawId}/reject`, { adminNote: note });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Withdrawal rejected" });
      setConfirmAction(null);
      setAdminNote("");
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject withdrawal",
        variant: "destructive",
      });
    },
  });

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;
  const isPending = status === "PENDING";

  if (!isPending) {
    return null;
  }

  const handleSubmit = () => {
    if (confirmAction === "approve") {
      approveMutation.mutate(adminNote);
    } else {
      rejectMutation.mutate(adminNote);
    }
  };

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

      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? "Approve this withdrawal request. You can add an optional note."
                : "Reject this withdrawal request. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNote">Admin Note {confirmAction === "reject" && "(recommended)"}</Label>
              <Textarea
                id="adminNote"
                placeholder="Enter admin note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              variant={confirmAction === "reject" ? "destructive" : "default"}
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminWithdrawActions;
