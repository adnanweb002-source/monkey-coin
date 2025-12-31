import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, User, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Package as PackageType } from "@/types/package";

interface WalletRule {
  [key: string]: number;
}

interface WalletBalance {
  type: string;
  balance: string;
}

interface PackagePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage: PackageType | null;
  packages: PackageType[];
  prefilledMemberId?: string;
  prefilledUserId?: number;
  isAdmin?: boolean;
}

const WALLET_LABELS: Record<string, string> = {
  F_WALLET: "Fund Wallet",
  M_WALLET: "Main Wallet",
  I_WALLET: "Income Wallet",
  BONUS_WALLET: "Bonus Wallet",
};

const formatCurrency = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const PackagePurchaseModal = ({
  open,
  onOpenChange,
  selectedPackage: initialPackage,
  packages,
  prefilledMemberId,
  prefilledUserId,
  isAdmin = false,
}: PackagePurchaseModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(initialPackage);
  const [amount, setAmount] = useState("");
  const [purchaseMode, setPurchaseMode] = useState<"self" | "downline">("self");
  const [targetMemberId, setTargetMemberId] = useState("");
  const [targetUserId, setTargetUserId] = useState<number | undefined>(prefilledUserId);
  const [walletAmounts, setWalletAmounts] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallet rules
  const { data: walletRules = {} } = useQuery<WalletRule>({
    queryKey: ["wallet-rules"],
    queryFn: async () => {
      const response = await api.get("/package/wallet-rules");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user wallets for balance check
  const { data: wallets = [] } = useQuery<WalletBalance[]>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await api.get("/wallet/my");
      return response.data;
    },
  });

  // Reset state when modal opens or prefilled data changes
  useEffect(() => {
    if (open) {
      setSelectedPackage(initialPackage);
      setAmount("");
      setWalletAmounts({});
      setValidationErrors([]);
      
      if (prefilledMemberId) {
        setPurchaseMode("downline");
        setTargetMemberId(prefilledMemberId);
        setTargetUserId(prefilledUserId);
      } else {
        setPurchaseMode("self");
        setTargetMemberId("");
        setTargetUserId(undefined);
      }
    }
  }, [open, initialPackage, prefilledMemberId, prefilledUserId]);

  // Initialize wallet amounts when rules are loaded
  useEffect(() => {
    if (Object.keys(walletRules).length > 0 && Object.keys(walletAmounts).length === 0) {
      const initial: Record<string, string> = {};
      Object.keys(walletRules).forEach((wallet) => {
        initial[wallet] = "";
      });
      setWalletAmounts(initial);
    }
  }, [walletRules]);

  const totalAmount = parseFloat(amount) || 0;

  // Calculate percentages for each wallet
  const walletPercentages = useMemo(() => {
    const percentages: Record<string, number> = {};
    Object.keys(walletAmounts).forEach((wallet) => {
      const walletAmt = parseFloat(walletAmounts[wallet]) || 0;
      percentages[wallet] = totalAmount > 0 ? (walletAmt / totalAmount) * 100 : 0;
    });
    return percentages;
  }, [walletAmounts, totalAmount]);

  const totalPercentage = useMemo(() => {
    return Object.values(walletPercentages).reduce((sum, pct) => sum + pct, 0);
  }, [walletPercentages]);

  // Get wallet balance map
  const walletBalanceMap = useMemo(() => {
    const map: Record<string, number> = {};
    wallets.forEach((w) => {
      map[w.type] = parseFloat(w.balance) || 0;
    });
    return map;
  }, [wallets]);

  // Validation
  useEffect(() => {
    const errors: string[] = [];

    if (totalAmount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (selectedPackage) {
      const minAmt = parseFloat(selectedPackage.investmentMin);
      const maxAmt = parseFloat(selectedPackage.investmentMax);
      if (totalAmount < minAmt || totalAmount > maxAmt) {
        errors.push(`Amount must be between ${formatCurrency(minAmt)} and ${formatCurrency(maxAmt)}`);
      }
    }

    // Check total percentage
    if (totalAmount > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Total split must equal 100% (current: ${totalPercentage.toFixed(1)}%)`);
    }

    // Check minimum percentages per wallet
    Object.entries(walletRules).forEach(([wallet, minPct]) => {
      const currentPct = walletPercentages[wallet] || 0;
      if (currentPct > 0 && currentPct < minPct) {
        errors.push(`${WALLET_LABELS[wallet] || wallet} must be at least ${minPct}%`);
      }
    });

    // Check negative values
    Object.entries(walletAmounts).forEach(([wallet, amt]) => {
      const numAmt = parseFloat(amt) || 0;
      if (numAmt < 0) {
        errors.push(`${WALLET_LABELS[wallet] || wallet} cannot be negative`);
      }
    });

    // Check wallet balances (only for self purchase)
    if (purchaseMode === "self") {
      Object.entries(walletAmounts).forEach(([wallet, amt]) => {
        const numAmt = parseFloat(amt) || 0;
        const balance = walletBalanceMap[wallet] || 0;
        if (numAmt > balance) {
          errors.push(`${WALLET_LABELS[wallet] || wallet} amount exceeds balance (${formatCurrency(balance)})`);
        }
      });
    }

    // Check member ID for downline purchase
    if (purchaseMode === "downline" && !targetMemberId.trim()) {
      errors.push("Member ID is required for downline purchase");
    }

    setValidationErrors(errors);
  }, [totalAmount, totalPercentage, walletRules, walletPercentages, walletAmounts, walletBalanceMap, selectedPackage, purchaseMode, targetMemberId]);

  const isValid = validationErrors.length === 0 && totalAmount > 0 && selectedPackage;

  const purchaseMutation = useMutation({
    mutationFn: async (data: {
      packageId: number;
      amount: string;
      userId?: number;
      split: Record<string, number>;
    }) => {
      const response = await api.post("/purchase", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Package purchased successfully!" });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to purchase package",
        variant: "destructive",
      });
    },
  });

  const handleWalletAmountChange = (wallet: string, value: string) => {
    setWalletAmounts((prev) => ({
      ...prev,
      [wallet]: value,
    }));
  };

  const handleSubmit = () => {
    if (!selectedPackage || !isValid) return;

    // Build split object as percentages
    const split: Record<string, number> = {};
    Object.entries(walletAmounts).forEach(([wallet, amt]) => {
      const numAmt = parseFloat(amt) || 0;
      if (numAmt > 0) {
        split[wallet] = Math.round((numAmt / totalAmount) * 100);
      }
    });

    const payload: {
      packageId: number;
      amount: string;
      userId?: number;
      split: Record<string, number>;
    } = {
      packageId: selectedPackage.id,
      amount: amount,
      split,
    };

    if (purchaseMode === "downline" && targetUserId) {
      payload.userId = targetUserId;
    }

    purchaseMutation.mutate(payload);
  };

  const activePackages = packages.filter((pkg) => pkg.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Purchase Package
          </DialogTitle>
          <DialogDescription>
            {selectedPackage
              ? `Invest in ${selectedPackage.name}`
              : "Select a package to purchase"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Package Selection */}
          {!initialPackage && (
            <div className="space-y-2">
              <Label>Select Package</Label>
              <div className="grid gap-2">
                {activePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedPackage?.id === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pkg.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(pkg.investmentMin)} - {formatCurrency(pkg.investmentMax)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="purchase-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="purchase-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
            {selectedPackage && (
              <p className="text-xs text-muted-foreground">
                Range: {formatCurrency(selectedPackage.investmentMin)} - {formatCurrency(selectedPackage.investmentMax)}
              </p>
            )}
          </div>

          {/* Purchase Mode Selection */}
          <div className="space-y-3">
            <Label>Purchase For</Label>
            <RadioGroup
              value={purchaseMode}
              onValueChange={(v) => setPurchaseMode(v as "self" | "downline")}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1",
                  purchaseMode === "self" ? "border-primary bg-primary/5" : "border-border"
                )}
                onClick={() => setPurchaseMode("self")}
              >
                <RadioGroupItem value="self" id="self" />
                <Label htmlFor="self" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Myself
                </Label>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1",
                  purchaseMode === "downline" ? "border-primary bg-primary/5" : "border-border"
                )}
                onClick={() => setPurchaseMode("downline")}
              >
                <RadioGroupItem value="downline" id="downline" />
                <Label htmlFor="downline" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  {isAdmin ? "Any User" : "Downline User"}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Member ID Input (for downline purchase) */}
          {purchaseMode === "downline" && (
            <div className="space-y-2">
              <Label htmlFor="member-id">Member ID</Label>
              <Input
                id="member-id"
                placeholder="Enter Member ID"
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
              />
              {prefilledMemberId && (
                <p className="text-xs text-muted-foreground">
                  Pre-filled from selected user
                </p>
              )}
            </div>
          )}

          {/* Wallet Split Allocation */}
          {Object.keys(walletRules).length > 0 && totalAmount > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Wallet Split Allocation</Label>
                <span
                  className={cn(
                    "text-sm font-medium",
                    Math.abs(totalPercentage - 100) <= 0.01
                      ? "text-green-600"
                      : "text-destructive"
                  )}
                >
                  Total: {totalPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(walletRules).map(([wallet, minPct]) => {
                  const balance = walletBalanceMap[wallet] || 0;
                  const pct = walletPercentages[wallet] || 0;

                  return (
                    <div
                      key={wallet}
                      className="p-3 rounded-lg border border-border bg-secondary/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">
                              {WALLET_LABELS[wallet] || wallet}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Min: {minPct}% | Bal: {formatCurrency(balance)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={walletAmounts[wallet] || ""}
                                onChange={(e) => handleWalletAmountChange(wallet, e.target.value)}
                                className="pl-7 h-9"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="w-20 text-right">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  pct > 0 && pct < minPct ? "text-destructive" : "text-foreground"
                                )}
                              >
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.slice(0, 3).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {validationErrors.length > 3 && (
                    <li>...and {validationErrors.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || purchaseMutation.isPending}
            className="w-full sm:w-auto"
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Package Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackagePurchaseModal;
