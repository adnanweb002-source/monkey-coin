import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { Package } from "@/types/package";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Percent, TrendingUp, Wallet, PackageIcon } from "lucide-react";
import { useState } from "react";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const Packages = () => {
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: packages = [], isLoading: isLoadingPackages, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await api.get("/packages");
      return response.data;
    },
  });

  const activePackages = packages.filter((pkg: Package) => pkg.isActive);

  const handlePurchase = async () => {
    if (!selectedPackage || !amount) return;

    setIsLoading(true);
    try {
      await api.post("/packages/purchase", {
        packageId: selectedPackage.id,
        amount: amount,
      });
      toast({
        title: "Success",
        description: "Package purchased successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setSelectedPackage(null);
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to purchase package: ${error?.response?.data?.message?.toLowerCase() || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPackages) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Packages</h1>
          <p className="text-muted-foreground mt-1">Choose a package to start investing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Packages</h1>
          <p className="text-muted-foreground mt-1">Choose a package to start investing</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <PackageIcon size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-lg font-medium">Failed to load packages</p>
          <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investment Packages</h1>
        <p className="text-muted-foreground mt-1">Choose a package to start investing</p>
      </div>

      {activePackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <PackageIcon size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">No packages available</p>
          <p className="text-muted-foreground/70 text-sm mt-1">Check back later for new investment packages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          {activePackages.map((pkg: Package) => (
            <div
              key={pkg.id}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedPackage(pkg)}
                >
                  Invest Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(pkg.investmentMin)} - {formatCurrency(pkg.investmentMax)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Return</p>
                    <p className="text-sm font-medium text-foreground">{pkg.dailyReturnPct}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium text-foreground">{pkg.durationDays} Days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Percent size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Capital Return</p>
                    <p className="text-sm font-medium text-foreground">{pkg.capitalReturn}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedPackage}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPackage(null);
            setAmount("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invest in {selectedPackage?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest (
              {selectedPackage && formatCurrency(selectedPackage.investmentMin)} -{" "}
              {selectedPackage && formatCurrency(selectedPackage.investmentMax)})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedPackage?.investmentMin}
                max={selectedPackage?.investmentMax}
              />
            </div>
          </div>
          <DialogDescription className="text-xs">
            Note: The amount will be deducted from M Wallet.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPackage(null);
                setAmount("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!amount || isLoading}>
              {isLoading ? "Processing..." : "Invest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
