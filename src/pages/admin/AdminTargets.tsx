import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTargets,
  getTargetStats,
  getBusinessVolumeStats,
  assignTarget,
  updateTarget,
  deleteTarget,
  type Target,
  type AssignTargetPayload,
} from "@/lib/adminTargetsApi";
import { getErrorMessage } from "@/lib/api";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Loader2, Target as TargetIcon, TrendingUp,
  Users, BarChart3, DollarSign, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MULTIPLIERS = ["X1", "X2", "X3", "X4", "X5", "X7", "X10"];
const SALES_TYPES = ["DIRECT", "INDIRECT"];

const WALLET_LABELS: Record<string, string> = {
  D_WALLET: "D Wallet",
  E_WALLET: "E Wallet",
  P_WALLET: "P Wallet",
  A_WALLET: "A Wallet",
};

interface WalletBalance {
  type: string;
  balance: string;
}

interface WalletRule {
  [key: string]: number;
}

const AdminTargets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [page, setPage] = useState(1);
  const [filterMemberId, setFilterMemberId] = useState("");
  const [filterSalesType, setFilterSalesType] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("");
  const limit = 20;

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form
  const [form, setForm] = useState({
    memberId: "",
    packageAmount: "",
    targetMultiplier: "X1",
    targetType: "DIRECT",
    targetNeededToUnlockDailyRoi: "",
    targetAmount: "",
  });
  const [walletAmounts, setWalletAmounts] = useState<Record<string, string>>({});

  // Fetch wallet data for split
  const { data: wallets = [] } = useQuery<WalletBalance[]>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await api.get("/wallet/user-wallets");
      return res.data;
    },
  });

  const { data: walletRules = {} } = useQuery<WalletRule>({
    queryKey: ["wallet-rules"],
    queryFn: async () => {
      const res = await api.get("/packages/wallet-rules");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-target-stats"],
    queryFn: getTargetStats,
  });

  const { data: bvStats, isLoading: bvLoading } = useQuery({
    queryKey: ["admin-target-bv-stats"],
    queryFn: getBusinessVolumeStats,
  });

  const queryParams = {
    page,
    limit,
    ...(filterMemberId && { memberId: filterMemberId }),
    ...(filterSalesType && { salesType: filterSalesType }),
    ...(filterCompleted && { completed: filterCompleted }),
  };

  const { data: targetsData, isLoading: targetsLoading } = useQuery({
    queryKey: ["admin-targets", queryParams],
    queryFn: () => getTargets(queryParams),
  });

  // Wallet split logic
  const totalAmount = parseFloat(form.packageAmount) || 0;

  const walletPercentages = useMemo(() => {
    const pcts: Record<string, number> = {};
    Object.keys(walletAmounts).forEach((w) => {
      const amt = parseFloat(walletAmounts[w]) || 0;
      pcts[w] = totalAmount > 0 ? (amt / totalAmount) * 100 : 0;
    });
    return pcts;
  }, [walletAmounts, totalAmount]);

  const walletBalanceMap = useMemo(() => {
    const map: Record<string, number> = {};
    wallets.forEach((w) => { map[w.type] = parseFloat(w.balance) || 0; });
    return map;
  }, [wallets]);

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      setIsAdmin(profile?.role === "ADMIN");
    }
  }, []);

  // For admin assigning, use A_WALLET only
  const availableWallets = useMemo(() => {
    return wallets.filter((w) => w.type === "A_WALLET");
  }, [wallets]);

  useEffect(() => {
    if (availableWallets.length > 0 && Object.keys(walletAmounts).length === 0) {
      const initial: Record<string, string> = {};
      availableWallets.forEach((w) => { initial[w.type] = ""; });
      setWalletAmounts(initial);
    }
  }, [availableWallets]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!form.memberId.trim()) errors.push("Member ID is required");
    if (totalAmount <= 0) errors.push("Package amount must be greater than 0");
    if (!form.targetNeededToUnlockDailyRoi || parseFloat(form.targetNeededToUnlockDailyRoi) < 0) {
      errors.push("Target needed to unlock daily ROI is required");
    }

    const totalSplitAmount = Object.values(walletAmounts).reduce(
      (sum, amt) => sum + (parseFloat(amt) || 0), 0
    );
    if (totalAmount > 0 && Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      errors.push(`Wallet amounts must equal $${totalAmount.toFixed(2)} (current: $${totalSplitAmount.toFixed(2)})`);
    }

    Object.entries(walletAmounts).forEach(([wallet, amt]) => {
      const numAmt = parseFloat(amt) || 0;
      const balance = walletBalanceMap[wallet] || 0;
      if (numAmt > balance) {
        errors.push(`${WALLET_LABELS[wallet] || wallet} exceeds balance ($${balance.toFixed(2)})`);
      }
    });

    return errors;
  }, [form, totalAmount, walletAmounts, walletBalanceMap]);

  const isFormValid = editingTarget
    ? form.memberId.trim() && totalAmount > 0
    : validationErrors.length === 0 && totalAmount > 0;

  // Mutations
  const assignMutation = useMutation({
    mutationFn: (data: AssignTargetPayload) => assignTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-targets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-bv-stats"] });
      toast({ title: "Target assigned successfully" });
      closeModal();
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssignTargetPayload> }) => updateTarget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-targets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-bv-stats"] });
      toast({ title: "Target updated successfully" });
      closeModal();
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTarget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-targets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-target-bv-stats"] });
      toast({ title: "Target deleted successfully" });
      setDeleteId(null);
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingTarget(null);
    setForm({ memberId: "", packageAmount: "", targetMultiplier: "X1", targetType: "DIRECT", targetNeededToUnlockDailyRoi: "", targetAmount: "" });
    const initial: Record<string, string> = {};
    availableWallets.forEach((w) => { initial[w.type] = ""; });
    setWalletAmounts(initial);
  };

  const openCreate = () => {
    setEditingTarget(null);
    setForm({ memberId: "", packageAmount: "", targetMultiplier: "X1", targetType: "DIRECT", targetNeededToUnlockDailyRoi: "", targetAmount:"" });
    const initial: Record<string, string> = {};
    availableWallets.forEach((w) => { initial[w.type] = ""; });
    setWalletAmounts(initial);
    setModalOpen(true);
  };

  const openEdit = (target: Target) => {
    console.log(target)
    setEditingTarget(target);
    setForm({
      memberId: target.user.memberId,
      packageAmount: String(target.packageAmount),
      targetMultiplier: target.multiplier,
      targetType: target.salesType,
      targetNeededToUnlockDailyRoi: "",
      targetAmount: String(target.targetAmount),
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingTarget) {
      updateMutation.mutate({
        id: editingTarget.id,
        data: {
          // packageAmount: parseFloat(form.packageAmount),
          multiplier: form.targetMultiplier,
          salesType: form.targetType,
          targetAmount: form.targetAmount
        },
      });
    } else {
      const split: Record<string, number> = {};
      Object.entries(walletAmounts).forEach(([wallet, amt]) => {
        const numAmt = parseFloat(amt) || 0;
        if (numAmt > 0) {
          split[wallet] = Math.round((numAmt / totalAmount) * 100);
        }
      });

      assignMutation.mutate({
        memberId: form.memberId,
        packageAmount: parseFloat(form.packageAmount),
        targetMultiplier: form.targetMultiplier,
        targetType: form.targetType,
        targetNeededToUnlockDailyRoi: parseFloat(form.targetNeededToUnlockDailyRoi),
        split,
      });
    }
  };

  const handleSearch = () => setPage(1);
  const handleReset = () => {
    setFilterMemberId("");
    setFilterSalesType("");
    setFilterCompleted("");
    setPage(1);
  };

  const isMutating = assignMutation.isPending || updateMutation.isPending;
  const meta = targetsData?.meta;
  const statsCards = [
    { label: "Total Targets Given", value: stats?.totalTargetsGiven ?? 0, icon: TargetIcon, color: "text-primary" },
    { label: "Total Targets Reached", value: stats?.totalTargetsReached ?? 0, icon: TrendingUp, color: "text-green-500" },
    { label: "Total ROI Generated", value: `$${(stats?.totalRoiGenerated ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-500" },
    { label: "ROI From Completed", value: `$${(stats?.roiFromCompletedTargets ?? 0).toLocaleString()}`, icon: BarChart3, color: "text-blue-500" },
  ];

  const bvCards = [
    { label: "Total Target Volume", value: `$${Number(bvStats?.totalTargetVolume ?? 0).toLocaleString()}` },
    { label: "Achieved Volume", value: `$${Number(bvStats?.totalAchievedVolume ?? 0).toLocaleString()}` },
    { label: "Remaining Volume", value: `$${Number(bvStats?.remainingVolume ?? 0).toLocaleString()}` },
    { label: "Avg Completion %", value: `${Number(bvStats?.averageCompletionPercent ?? 0).toFixed(1)}%` },
    { label: "Users Under Lock", value: bvStats?.usersUnderTargetLock ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TargetIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Target Management</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Assign Target
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              {statsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-secondary", card.color)}>
                    <card.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-semibold">{card.value}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Volume Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {bvCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              {bvLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-lg font-semibold">{card.value}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Member ID</Label>
          <Input
            placeholder="Search member..."
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sales Type</Label>
          <Select value={filterSalesType} onValueChange={setFilterSalesType}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {SALES_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={filterCompleted} onValueChange={setFilterCompleted}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="true">Completed</SelectItem>
              <SelectItem value="false">Running</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleSearch}>Search</Button>
        <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Package Amt</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Target Amt</TableHead>
              <TableHead>Achieved</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Sales Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targetsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : targetsData?.data?.length ? (
              targetsData.data.map((target, idx) => (
                <TableRow key={target.id}>
                  <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                  <TableCell className="font-medium">{target.user.memberId}</TableCell>
                  <TableCell>${target.packageAmount.toLocaleString()}</TableCell>
                  <TableCell>{target.multiplier}</TableCell>
                  <TableCell>${target.targetAmount.toLocaleString()}</TableCell>
                  <TableCell>${target.achieved.toLocaleString()}</TableCell>
                  <TableCell>${(Number(target?.targetAmount) - Number(target?.achieved)).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{target.salesType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={target.completed ? "default" : "secondary"}>
                      {target.completed ? "Completed" : "Running"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(target)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(target.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No targets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Assign / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTarget ? "Edit Target" : "Assign Target"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Member ID</Label>
              <Input value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} placeholder="Enter Member ID" />
            </div>
            <div className="space-y-2">
              <Label>Package Amount</Label>
              <Input
                type="number"
                value={form.packageAmount}
                onChange={(e) => setForm({ ...form, packageAmount: e.target.value })}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0.00"
              />
            </div>
             <div className="space-y-2">
              <Label>Target Amount</Label>
              <Input
                type="number"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Multiplier</Label>
                <Select value={form.targetMultiplier} onValueChange={(v) => setForm({ ...form, targetMultiplier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MULTIPLIERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Sales Type</Label>
                <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SALES_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!editingTarget && (
              <>
                <div className="space-y-2">
                  <Label>Target Needed To Unlock Daily ROI</Label>
                  <Input
                    type="number"
                    value={form.targetNeededToUnlockDailyRoi}
                    onChange={(e) => setForm({ ...form, targetNeededToUnlockDailyRoi: e.target.value })}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0"
                  />
                </div>

                {/* Wallet Split */}
                {availableWallets.length > 0 && totalAmount > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Wallet Split Allocation</Label>
                      <span className="text-xs text-muted-foreground">
                        Total must equal ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-primary/10 p-2 rounded-md">
                      Admin target assignment uses Bonus Wallet only.
                    </p>
                    <div className="space-y-3">
                      {availableWallets.map((walletData) => {
                        const wallet = walletData.type;
                        const balance = walletBalanceMap[wallet] || 0;
                        const walletAmt = parseFloat(walletAmounts[wallet]) || 0;
                        const exceedsBalance = walletAmt > balance;

                        return (
                          <div key={wallet} className="p-3 rounded-lg border border-border bg-secondary/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{WALLET_LABELS[wallet] || wallet}</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={walletAmounts[wallet] || ""}
                                onChange={(e) => setWalletAmounts({ ...walletAmounts, [wallet]: e.target.value })}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className={cn(
                                  "pl-7 h-9 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                  exceedsBalance && "border-destructive focus-visible:ring-destructive"
                                )}
                              />
                            </div>
                            <p className={cn("text-xs mt-1.5", exceedsBalance ? "text-destructive" : "text-muted-foreground")}>
                              Available Balance: ${balance.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Calculated target preview */}
            {totalAmount > 0 && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  Calculated Target: <span className="font-semibold text-foreground">
                    ${(totalAmount * parseInt(form.targetMultiplier.replace("X", ""))).toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* Validation */}
            {!editingTarget && validationErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.slice(0, 3).map((err, i) => <li key={i}>{err}</li>)}
                    {validationErrors.length > 3 && <li>...and {validationErrors.length - 3} more</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating || !isFormValid}>
              {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTarget ? "Update" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this target?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTargets;
