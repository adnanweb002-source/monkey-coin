import { Button } from "@/components/ui/button";
import type { Package } from "@/types/package";
import { Clock, Percent, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import PackagePurchaseModal from "@/components/tree/PackagePurchaseModal";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const PackagesSection = ({ packages }: { packages: Package[] }) => {
  const activePackages = packages.filter((pkg) => pkg.isActive);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenPurchase = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-[420px] flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 shrink-0">
        Packages
      </h3>

      {activePackages.length > 0 ? (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-0">
          {activePackages.map((pkg) => (
            <div key={pkg.id} className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center  gap-x-4 justify-between mb-4">
                <h4 className="font-semibold text-foreground">{pkg.name}</h4>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleOpenPurchase(pkg)}
                >
                  Purchase Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(pkg.investmentMin)} -{" "}
                      {formatCurrency(pkg.investmentMax)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp size={14} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Daily Return
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {pkg.dailyReturnPct}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium text-foreground">
                      {pkg.durationDays} Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Percent size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Capital Return
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {pkg.capitalReturn}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Wallet size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No packages available</p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            Check back later for new packages
          </p>
        </div>
      )}

      <PackagePurchaseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedPackage={selectedPackage}
        packages={activePackages}
      />
    </div>
  );
};

export default PackagesSection;
