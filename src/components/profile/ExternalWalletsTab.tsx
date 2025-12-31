import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

interface SupportedWalletType {
  id: number;
  name: string;
  currency: string;
  allowedChangeCount: number;
}

interface UserExternalWallet {
  id: number;
  supportedWalletId: number;
  address: string;
  changeCount: number;
  supportedWallet: SupportedWalletType;
}

const ExternalWalletsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addingWalletType, setAddingWalletType] = useState<SupportedWalletType | null>(null);
  const [editingWallet, setEditingWallet] = useState<UserExternalWallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<UserExternalWallet | null>(null);
  const [address, setAddress] = useState("");

  // Fetch supported wallet types
  const { data: supportedTypes = [], isLoading: typesLoading } = useQuery<SupportedWalletType[]>({
    queryKey: ["supportedWalletTypes"],
    queryFn: async () => {
      const response = await api.get("/wallet/admin/supported-wallet-types");
      return response.data;
    },
  });

  // Fetch user's external wallets
  const { data: userWallets = [], isLoading: walletsLoading } = useQuery<UserExternalWallet[]>({
    queryKey: ["myExternalWallets"],
    queryFn: async () => {
      const response = await api.get("/wallet/my-external-wallets");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { supportedWalletId: number; address: string }) => {
      const response = await api.post("/wallet/create-external-wallet", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet added successfully" });
      queryClient.invalidateQueries({ queryKey: ["myExternalWallets"] });
      setAddingWalletType(null);
      setAddress("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add wallet",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ walletId, address }: { walletId: number; address: string }) => {
      const response = await api.put(`/wallet/${walletId}/update-external-wallet`, { address });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["myExternalWallets"] });
      setEditingWallet(null);
      setAddress("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update wallet",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await api.delete(`/wallet/${walletId}/delete-external-wallet`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["myExternalWallets"] });
      setDeletingWallet(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete wallet",
        variant: "destructive",
      });
    },
  });

  const handleOpenAdd = (walletType: SupportedWalletType) => {
    setAddress("");
    setAddingWalletType(walletType);
  };

  const handleOpenEdit = (wallet: UserExternalWallet) => {
    setAddress(wallet.address);
    setEditingWallet(wallet);
  };

  const handleCreate = () => {
    if (!addingWalletType) return;
    if (!address.trim()) {
      toast({ title: "Validation Error", description: "Wallet address is required", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      supportedWalletId: addingWalletType.id,
      address: address.trim(),
    });
  };

  const handleUpdate = () => {
    if (!editingWallet) return;
    if (!address.trim()) {
      toast({ title: "Validation Error", description: "Wallet address is required", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      walletId: editingWallet.id,
      address: address.trim(),
    });
  };

  const handleDelete = () => {
    if (!deletingWallet) return;
    deleteMutation.mutate(deletingWallet.id);
  };

  // Get user wallet by supported type ID
  const getUserWallet = (supportedId: number): UserExternalWallet | undefined => {
    return userWallets.find((w) => w.supportedWalletId === supportedId);
  };

  const isLoading = typesLoading || walletsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (supportedTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Wallet size={48} className="mx-auto mb-4 opacity-50" />
            <p>No external wallet types available</p>
            <p className="text-sm mt-1">Please contact support for assistance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            External Wallets
          </CardTitle>
          <CardDescription>
            Add and manage your external cryptocurrency wallet addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedTypes.map((walletType) => {
              const userWallet = getUserWallet(walletType.id);
              const remainingChanges = userWallet
                ? walletType.allowedChangeCount - userWallet.changeCount
                : walletType.allowedChangeCount;
              const canEdit = remainingChanges > 0;

              return (
                <div
                  key={walletType.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">{walletType.name}</h4>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {walletType.currency}
                    </Badge>
                  </div>

                  {userWallet ? (
                    <>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Wallet Address</Label>
                        <p className="font-mono text-sm break-all bg-secondary/50 p-2 rounded">
                          {userWallet.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Changes used: {userWallet.changeCount} / {walletType.allowedChangeCount}
                        </span>
                        {!canEdit && (
                          <Badge variant="destructive" className="text-xs">
                            Limit reached
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(userWallet)}
                          disabled={!canEdit}
                          className="flex-1"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingWallet(userWallet)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-4 text-center text-muted-foreground">
                        <p className="text-sm">Not added yet</p>
                      </div>
                      <Button
                        onClick={() => handleOpenAdd(walletType)}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Wallet
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Wallet Dialog */}
      <Dialog open={!!addingWalletType} onOpenChange={(open) => !open && setAddingWalletType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {addingWalletType?.name} Wallet</DialogTitle>
            <DialogDescription>
              Enter your {addingWalletType?.currency} wallet address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter your ${addingWalletType?.currency} address`}
                className="font-mono"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You can change this address up to {addingWalletType?.allowedChangeCount} time(s) after adding.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setAddingWalletType(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Wallet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Wallet Dialog */}
      <Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingWallet?.supportedWallet.name} Wallet</DialogTitle>
            <DialogDescription>
              Update your {editingWallet?.supportedWallet.currency} wallet address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-address">Wallet Address *</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter your ${editingWallet?.supportedWallet.currency} address`}
                className="font-mono"
              />
            </div>

            {editingWallet && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">
                    Remaining changes: {editingWallet.supportedWallet.allowedChangeCount - editingWallet.changeCount}
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-500">
                    This action will use 1 of your remaining changes.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditingWallet(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Wallet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingWallet} onOpenChange={(open) => !open && setDeletingWallet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your {deletingWallet?.supportedWallet.name} wallet?
              You can add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExternalWalletsTab;
