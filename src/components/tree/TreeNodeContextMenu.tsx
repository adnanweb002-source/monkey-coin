import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { TreeNode } from "@/types/tree";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRightLeft,
  Ban,
  CheckCircle,
  ShieldOff,
  KeyRound,
  Loader2,
  Gift,
} from "lucide-react";
import TransferToUserModal from "./TransferToUserModal";
import SendBonusModal from "./SendBonusModal";

interface TreeNodeContextMenuProps {
  node: TreeNode;
  children: React.ReactNode;
  isAdmin: boolean;
}

type AdminAction = "suspend" | "activate" | "disable2fa" | "resetPassword" | null;

const TreeNodeContextMenu = ({ node, children, isAdmin }: TreeNodeContextMenuProps) => {
  const [transferOpen, setTransferOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<AdminAction>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getName = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const suspendMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/admin/users/${userId}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to suspend user", 
        variant: "destructive" 
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/admin/users/${userId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User activated successfully" });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to activate user", 
        variant: "destructive" 
      });
    },
  });

  const disable2faMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/admin/users/${userId}/disable-2fa`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "2FA disabled successfully" });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to disable 2FA", 
        variant: "destructive" 
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const response = await api.patch(`/admin/users/${userId}/set-password`, { password });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password reset successfully" });
      setResetPasswordOpen(false);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to reset password", 
        variant: "destructive" 
      });
    },
  });

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case "suspend":
        suspendMutation.mutate(node.id);
        break;
      case "activate":
        activateMutation.mutate(node.id);
        break;
      case "disable2fa":
        disable2faMutation.mutate(node.id);
        break;
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    resetPasswordMutation.mutate({ userId: node.id, password: newPassword });
  };

  const isProcessing = suspendMutation.isPending || activateMutation.isPending || 
                       disable2faMutation.isPending || resetPasswordMutation.isPending;

  const getConfirmMessage = () => {
    switch (confirmAction) {
      case "suspend":
        return `Are you sure you want to suspend ${getName(node.email)}? They will not be able to access their account.`;
      case "activate":
        return `Are you sure you want to activate ${getName(node.email)}?`;
      case "disable2fa":
        return `Are you sure you want to disable 2FA for ${getName(node.email)}? This will remove their two-factor authentication.`;
      default:
        return "";
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer Funds to This User
          </ContextMenuItem>

          {isAdmin && (
            <>
              <ContextMenuSeparator />
              
              <ContextMenuItem onClick={() => setBonusOpen(true)}>
                <Gift className="mr-2 h-4 w-4 text-primary" />
                Send Bonus
              </ContextMenuItem>

              <ContextMenuSeparator />
              
              {node.isActive ? (
                <ContextMenuItem 
                  onClick={() => setConfirmAction("suspend")}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={() => setConfirmAction("activate")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate User
                </ContextMenuItem>
              )}

              <ContextMenuItem onClick={() => setConfirmAction("disable2fa")}>
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable 2FA
              </ContextMenuItem>

              <ContextMenuItem onClick={() => setResetPasswordOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Transfer Modal */}
      <TransferToUserModal
        open={transferOpen}
        onOpenChange={setTransferOpen}
        recipientMemberId={node.memberId}
        recipientName={getName(node.email)}
      />

      {/* Send Bonus Modal */}
      {isAdmin && (
        <SendBonusModal
          open={bonusOpen}
          onOpenChange={setBonusOpen}
          userId={node.id}
          userName={getName(node.email)}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null && confirmAction !== "resetPassword"} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {getName(node.email)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TreeNodeContextMenu;
