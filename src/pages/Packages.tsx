import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Package } from "@/types/package";
import { useQuery } from "@tanstack/react-query";
import { Clock, Percent, TrendingUp, Wallet, PackageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PackagePurchaseModal from "@/components/tree/PackagePurchaseModal";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const getTimeParts = (targetMs: number, nowMs: number) => {
  const remaining = Math.max(0, targetMs - nowMs);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return { days, hours, minutes, seconds };
};

const Packages = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const { t } = useTranslation();

  const promoEnabled = import.meta.env.VITE_PACKAGES_PROMO_ENABLED === "true";
  const promoEndAt = import.meta.env.VITE_PACKAGES_PROMO_END_AT as
    | string
    | undefined;
  const promoImage =
    (import.meta.env.VITE_PACKAGES_PROMO_IMAGE_URL as string | undefined) ||
    "/panel/images/early-joiners-poster.png";

  const promoEndMs = useMemo(() => {
    if (!promoEndAt) return Number.NaN;
    return new Date(promoEndAt).getTime();
  }, [promoEndAt]);

  const showPromoBanner =
    promoEnabled && Number.isFinite(promoEndMs) && nowMs < promoEndMs;

  useEffect(() => {
    if (!showPromoBanner) return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showPromoBanner]);

  const countdown = useMemo(() => {
    if (!showPromoBanner) return null;
    return getTimeParts(promoEndMs, nowMs);
  }, [showPromoBanner, promoEndMs, nowMs]);

  const { data: packages = [], isLoading: isLoadingPackages, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await api.get("/packages");
      return response.data;
    },
  });

  const activePackages = packages.filter((pkg: Package) => pkg.isActive);

  const handleOpenPurchase = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  if (isLoadingPackages) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("packages.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("packages.subtitle")}</p>
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
          <h1 className="text-2xl font-bold text-foreground">{t("packages.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("packages.subtitle")}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <PackageIcon size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-lg font-medium">{t("packages.failedToLoad")}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("packages.tryAgainLater")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("packages.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("packages.subtitle")}</p>
      </div>

      {showPromoBanner && countdown && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <img
            src={promoImage}
            alt={t("packages.promoPosterAlt")}
            className="w-full h-auto object-cover"
          />
          <div className="px-4 py-4 md:px-6 md:py-5 border-t border-border">
            <p className="text-sm md:text-base font-medium text-foreground mb-3">
              {t("packages.promoCountdownLabel")}
            </p>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[
                { key: "days", value: countdown.days, label: t("packages.days") },
                { key: "hours", value: countdown.hours, label: t("packages.hours") },
                { key: "minutes", value: countdown.minutes, label: t("packages.minutes") },
                { key: "seconds", value: countdown.seconds, label: t("packages.seconds") },
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg bg-secondary/40 border border-border p-2 text-center"
                >
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-none">
                    {String(item.value).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePackages.length === 0 && !isLoadingPackages && !isError  && !showPromoBanner ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <PackageIcon size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">{t("packages.noPackages")}</p>
          <p className="text-muted-foreground/70 text-sm mt-1">{t("packages.checkBackLater")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          {activePackages.map((pkg: Package) => (
            <div key={pkg.id} className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                <Button variant="default" size="sm" onClick={() => handleOpenPurchase(pkg)}>
                  {t("packages.investNow")}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("packages.investment")}</p>
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
                    <p className="text-xs text-muted-foreground">{t("packages.dailyReturn")}</p>
                    <p className="text-sm font-medium text-foreground">{pkg.dailyReturnPct}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("packages.duration")}</p>
                    <p className="text-sm font-medium text-foreground">{pkg.durationDays} {t("profile.days")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Percent size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("packages.capitalReturn")}</p>
                    <p className="text-sm font-medium text-foreground">{pkg.capitalReturn}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

export default Packages;
