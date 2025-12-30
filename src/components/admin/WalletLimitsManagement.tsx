import { useState, useEffect } from "react";
import {
  Settings,
  Edit2,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Banknote,
  TrendingUp,
  PiggyBank,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type WalletType = "F_WALLET" | "I_WALLET" | "M_WALLET" | "BONUS_WALLET";

interface WalletLimit {
  id?: number;
  walletType: WalletType;
  minWithdrawal: string;
  maxPerTx: string;
  maxTxCount24h: number;
  maxAmount24h: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const walletTypeConfig: Record<WalletType, { name: string; icon: React.ElementType; color: string }> = {
  F_WALLET: { name: "Deposit Wallet", icon: Banknote, color: "bg-blue-500" },
  M_WALLET: { name: "ROI / Direct Income Wallet", icon: TrendingUp, color: "bg-green-500" },
  I_WALLET: { name: "Binary Income Wallet", icon: PiggyBank, color: "bg-purple-500" },
  BONUS_WALLET: { name: "Bonus Wallet", icon: Gift, color: "bg-orange-500" },
};

const ALL_WALLET_TYPES: WalletType[] = ["F_WALLET", "M_WALLET", "I_WALLET", "BONUS_WALLET"];

const WalletLimitsManagement = () => {
  const { toast } = useToast();
  const [limits, setLimits] = useState<WalletLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<WalletLimit | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    minWithdrawal: "",
    maxPerTx: "",
    maxTxCount24h: "",
    maxAmount24h: "",
    isActive: true,
  });

  const fetchLimits = async (showRefreshToast = false) => {
    if (showRefreshToast) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/get-wallet-limits");
      setLimits(response.data || []);
      if (showRefreshToast) {
        toast({ title: "Refreshed", description: "Wallet limits updated" });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch wallet limits";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const getLimitForType = (type: WalletType): WalletLimit | undefined => {
    return limits.find((l) => l.walletType === type);
  };

  const handleEdit = (type: WalletType) => {
    const existing = getLimitForType(type);
    if (existing) {
      setEditingLimit(existing);
      setFormData({
        minWithdrawal: existing.minWithdrawal || "",
        maxPerTx: existing.maxPerTx || "",
        maxTxCount24h: existing.maxTxCount24h?.toString() || "",
        maxAmount24h: existing.maxAmount24h || "",
        isActive: existing.isActive ?? true,
      });
    } else {
      // New limit
      setEditingLimit({
        walletType: type,
        minWithdrawal: "10",
        maxPerTx: "500",
        maxTxCount24h: 3,
        maxAmount24h: "1000",
        isActive: true,
      });
      setFormData({
        minWithdrawal: "10",
        maxPerTx: "500",
        maxTxCount24h: "3",
        maxAmount24h: "1000",
        isActive: true,
      });
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const min = parseFloat(formData.minWithdrawal);
    const maxTx = parseFloat(formData.maxPerTx);
    const maxAmount = parseFloat(formData.maxAmount24h);
    const maxCount = parseInt(formData.maxTxCount24h);

    if (isNaN(min) || min <= 0) {
      setFormError("Minimum withdrawal must be greater than 0");
      return false;
    }
    if (isNaN(maxTx) || maxTx < min) {
      setFormError("Max per transaction must be >= minimum withdrawal");
      return false;
    }
    if (isNaN(maxAmount) || maxAmount < maxTx) {
      setFormError("Max amount in 24h must be >= max per transaction");
      return false;
    }
    if (isNaN(maxCount) || maxCount < 1) {
      setFormError("Max transactions in 24h must be at least 1");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!editingLimit) return;
    setFormError(null);

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await api.post("/admin/wallet-limits/upsert", {
        walletType: editingLimit.walletType,
        minWithdrawal: formData.minWithdrawal,
        maxPerTx: formData.maxPerTx,
        maxTxCount24h: parseInt(formData.maxTxCount24h),
        maxAmount24h: formData.maxAmount24h,
        isActive: formData.isActive,
      });

      toast({ title: "Success", description: "Wallet limit saved successfully" });
      setIsModalOpen(false);
      fetchLimits();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save wallet limit";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <Card className="border-orange-500/30">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Wallet Limits (Admin Control)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchLimits()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Wallet Limits (Admin Control)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLimits(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Type</TableHead>
                  <TableHead className="text-right">Min Withdrawal</TableHead>
                  <TableHead className="text-right">Max / Tx</TableHead>
                  <TableHead className="text-right">Max Tx / 24h</TableHead>
                  <TableHead className="text-right">Max Amount / 24h</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_WALLET_TYPES.map((type) => {
                  const limit = getLimitForType(type);
                  const config = walletTypeConfig[type];
                  const IconComponent = config.icon;

                  return (
                    <TableRow key={type}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {limit ? formatCurrency(limit.minWithdrawal) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {limit ? formatCurrency(limit.maxPerTx) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {limit ? limit.maxTxCount24h : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {limit ? formatCurrency(limit.maxAmount24h) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {limit ? (
                          limit.isActive ? (
                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not Set
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(type)}>
                          {limit ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {ALL_WALLET_TYPES.map((type) => {
              const limit = getLimitForType(type);
              const config = walletTypeConfig[type];
              const IconComponent = config.icon;

              return (
                <Card key={type} className="bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                        {limit ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>

                    {limit ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Withdrawal</span>
                          <span className="font-medium">{formatCurrency(limit.minWithdrawal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max / Tx</span>
                          <span className="font-medium">{formatCurrency(limit.maxPerTx)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Tx / 24h</span>
                          <span className="font-medium">{limit.maxTxCount24h}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Amount / 24h</span>
                          <span className="font-medium">{formatCurrency(limit.maxAmount24h)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-muted-foreground">Status</span>
                          {limit.isActive ? (
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-500">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No limits configured. Click + to add.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLimit && getLimitForType(editingLimit.walletType)
                ? "Edit Wallet Limit"
                : "Add Wallet Limit"}
            </DialogTitle>
            <DialogDescription>
              Configure withdrawal limits for{" "}
              {editingLimit ? walletTypeConfig[editingLimit.walletType]?.name : "this wallet"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Wallet Type (disabled) */}
            <div className="space-y-2">
              <Label>Wallet Type</Label>
              <Input
                value={editingLimit ? walletTypeConfig[editingLimit.walletType]?.name : ""}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Min Withdrawal */}
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal ($)</Label>
              <Input
                id="minWithdrawal"
                type="number"
                min="0"
                step="0.01"
                value={formData.minWithdrawal}
                onChange={(e) => setFormData({ ...formData, minWithdrawal: e.target.value })}
                placeholder="10.00"
              />
            </div>

            {/* Max Per Tx */}
            <div className="space-y-2">
              <Label htmlFor="maxPerTx">Maximum Per Transaction ($)</Label>
              <Input
                id="maxPerTx"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxPerTx}
                onChange={(e) => setFormData({ ...formData, maxPerTx: e.target.value })}
                placeholder="500.00"
              />
            </div>

            {/* Max Tx Count 24h */}
            <div className="space-y-2">
              <Label htmlFor="maxTxCount24h">Max Transactions in 24 Hours</Label>
              <Input
                id="maxTxCount24h"
                type="number"
                min="1"
                step="1"
                value={formData.maxTxCount24h}
                onChange={(e) => setFormData({ ...formData, maxTxCount24h: e.target.value })}
                placeholder="3"
              />
            </div>

            {/* Max Amount 24h */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount24h">Max Amount in 24 Hours ($)</Label>
              <Input
                id="maxAmount24h"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxAmount24h}
                onChange={(e) => setFormData({ ...formData, maxAmount24h: e.target.value })}
                placeholder="1000.00"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Form Error */}
            {formError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Limit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletLimitsManagement;
