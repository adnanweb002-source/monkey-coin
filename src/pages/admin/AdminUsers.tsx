import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  ShieldOff,
  KeyRound,
  Loader2,
  Users,
} from "lucide-react";

interface User {
  id: number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

const AdminUsers = () => {
  const [page, setPage] = useState(0);
  const [take] = useState(20);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "activate" | "disable2fa" | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, take],
    queryFn: async () => {
      const response = await api.get(`/admin/users/list?take=${take}&skip=${page * take}`);
      return response.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/admin/users/${userId}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      closeDialogs();
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      closeDialogs();
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      closeDialogs();
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
      closeDialogs();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to reset password", 
        variant: "destructive" 
      });
    },
  });

  const closeDialogs = () => {
    setSelectedUser(null);
    setActionType(null);
    setResetPasswordOpen(false);
    setNewPassword("");
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    switch (actionType) {
      case "suspend":
        suspendMutation.mutate(selectedUser.id);
        break;
      case "activate":
        activateMutation.mutate(selectedUser.id);
        break;
      case "disable2fa":
        disable2faMutation.mutate(selectedUser.id);
        break;
    }
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
  };

  const isProcessing = suspendMutation.isPending || activateMutation.isPending || 
                       disable2faMutation.isPending || resetPasswordMutation.isPending;

  const totalPages = data ? Math.ceil(data.total / take) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Inactive</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <Users className="w-12 h-12 mb-4" />
        <p>Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage all users in the system</p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Member ID</TableHead>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Role</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-mono text-sm">{user.memberId}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || "-"}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {user.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => { setSelectedUser(user); setActionType("suspend"); }}
                            title="Suspend User"
                          >
                            <Ban size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-600"
                            onClick={() => { setSelectedUser(user); setActionType("activate"); }}
                            title="Activate User"
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedUser(user); setActionType("disable2fa"); }}
                          title="Disable 2FA"
                        >
                          <ShieldOff size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedUser(user); setResetPasswordOpen(true); }}
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.total > take && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {page * take + 1} to {Math.min((page + 1) * take, data.total)} of {data.total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "suspend" && `Are you sure you want to suspend ${selectedUser?.firstName} ${selectedUser?.lastName}? They will not be able to access their account.`}
              {actionType === "activate" && `Are you sure you want to activate ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
              {actionType === "disable2fa" && `Are you sure you want to disable 2FA for ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
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
              Set a new password for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
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
    </div>
  );
};

export default AdminUsers;
