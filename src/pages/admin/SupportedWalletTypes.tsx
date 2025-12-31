import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupportedWalletType {
  id: number;
  name: string;
  currency: string;
  allowedChangeCount: number;
}

interface WalletTypeFormData {
  name: string;
  currency: string;
  allowedChangeCount: string;
}

const SupportedWalletTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<SupportedWalletType | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<SupportedWalletType | null>(null);
  const [formData, setFormData] = useState<WalletTypeFormData>({
    name: "",
    currency: "",
    allowedChangeCount: "0",
  });

  const { data: walletTypes = [], isLoading } = useQuery<SupportedWalletType[]>({
    queryKey: ["supportedWalletTypes"],
    queryFn: async () => {
      const response = await api.get("/wallet/admin/supported-wallet-types");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; currency: string; allowedChangeCount: number }) => {
      const response = await api.post("/wallet/admin/create-external-wallet-type", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet type created successfully" });
      queryClient.invalidateQueries({ queryKey: ["supportedWalletTypes"] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create wallet type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; currency: string; allowedChangeCount: number } }) => {
      const response = await api.put(`/wallet/admin/${id}/update-external-wallet-type`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet type updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["supportedWalletTypes"] });
      setEditingWallet(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update wallet type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/wallet/admin/${id}/delete-external-wallet-type`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet type deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["supportedWalletTypes"] });
      setDeletingWallet(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete wallet type",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", currency: "", allowedChangeCount: "0" });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (wallet: SupportedWalletType) => {
    setFormData({
      name: wallet.name,
      currency: wallet.currency,
      allowedChangeCount: wallet.allowedChangeCount.toString(),
    });
    setEditingWallet(wallet);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return false;
    }
    if (!formData.currency.trim()) {
      toast({ title: "Validation Error", description: "Currency is required", variant: "destructive" });
      return false;
    }
    const changeCount = parseInt(formData.allowedChangeCount);
    if (isNaN(changeCount) || changeCount < 0) {
      toast({ title: "Validation Error", description: "Allowed change count must be 0 or greater", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    createMutation.mutate({
      name: formData.name.trim(),
      currency: formData.currency.trim(),
      allowedChangeCount: parseInt(formData.allowedChangeCount),
    });
  };

  const handleUpdate = () => {
    if (!editingWallet || !validateForm()) return;
    updateMutation.mutate({
      id: editingWallet.id,
      data: {
        name: formData.name.trim(),
        currency: formData.currency.trim(),
        allowedChangeCount: parseInt(formData.allowedChangeCount),
      },
    });
  };

  const handleDelete = () => {
    if (!deletingWallet) return;
    deleteMutation.mutate(deletingWallet.id);
  };

  const handleChangeCountInput = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({ ...formData, allowedChangeCount: value });
    }
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Bitcoin, Ethereum"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency *</Label>
        <Input
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          placeholder="e.g., BTC, ETH, USDT"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allowedChangeCount">Allowed Change Count *</Label>
        <Input
          id="allowedChangeCount"
          type="text"
          inputMode="numeric"
          value={formData.allowedChangeCount}
          onChange={(e) => handleChangeCountInput(e.target.value)}
          placeholder="0"
        />
        <p className="text-sm text-muted-foreground">
          Number of times users can change their wallet address
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supported External Wallet Types</h1>
          <p className="text-muted-foreground">Manage external wallet types that users can add</p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Wallet Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Wallet Types
          </CardTitle>
          <CardDescription>
            {walletTypes.length} wallet type{walletTypes.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p>No wallet types configured yet</p>
            </div>
          ) : isMobile ? (
            // Mobile: Stacked cards
            <div className="space-y-4">
              {walletTypes.map((wallet) => (
                <div
                  key={wallet.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                    <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                      {wallet.currency}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Allowed Changes: <span className="font-medium text-foreground">{wallet.allowedChangeCount}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(wallet)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingWallet(wallet)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Name</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Allowed Changes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletTypes.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">{wallet.name}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-secondary px-2 py-1 rounded text-sm">
                        {wallet.currency}
                      </span>
                    </TableCell>
                    <TableCell>{wallet.allowedChangeCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(wallet)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingWallet(wallet)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Wallet Type</DialogTitle>
            <DialogDescription>
              Create a new external wallet type that users can add to their profile.
            </DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
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
                  Creating...
                </>
              ) : (
                "Create Wallet Type"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Wallet Type</DialogTitle>
            <DialogDescription>
              Update the wallet type configuration.
            </DialogDescription>
          </DialogHeader>
          <FormFields />
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
                "Update Wallet Type"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingWallet} onOpenChange={(open) => !open && setDeletingWallet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingWallet?.name}"? This action cannot be undone
              and may affect users who have added this wallet type.
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
    </div>
  );
};

export default SupportedWalletTypes;
