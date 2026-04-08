import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import WalletCards from "@/components/dashboard/WalletCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { walletConfig } from "@/lib/config";
import { Loader2, AlertTriangle } from "lucide-react";
import type { WalletCard as WalletCardType } from "@/types/wallet";
import { useGetWallets } from "../api";
import { useGetSettings } from "../api";

type WalletType = "D_WALLET" | "P_WALLET" | "E_WALLET" | "A_WALLET";

const externalSchema = z.object({
  fromWalletType: z.string().min(1, "Select wallet"),
  toMemberId: z.string().min(1, "Member ID is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
});

type ExternalFormData = z.infer<typeof externalSchema>;

const Transfer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { data: wallets = [], isLoading: walletsLoading } = useGetWallets();
  const { data: settings = [], isLoading: settingsLoading } = useGetSettings();

  const externalForm = useForm<ExternalFormData>({
    resolver: zodResolver(externalSchema),
    defaultValues: { fromWalletType: "", toMemberId: "", amount: "" },
  });

  const externalMutation = useMutation({
    mutationFn: async (data: ExternalFormData) => { const response = await api.post("/wallet/transfer", data); return response.data; },
    onSuccess: () => { toast({ title: t("common.success"), description: t("wallet.transferSuccess") }); queryClient.invalidateQueries({ queryKey: ["wallets"] }); externalForm.reset(); },
    onError: (error: any) => { toast({ title: t("common.error"), description: error.response?.data?.message || t("wallet.transferFailed"), variant: "destructive" }); },
  });

  const walletTypes: WalletType[] = ["D_WALLET", "P_WALLET", "E_WALLET", "A_WALLET"];
  const walletLabels: Record<string, string> = { D_WALLET: "D Wallet", P_WALLET: "P Wallet", E_WALLET: "E Wallet", A_WALLET: "A Wallet" };

  const getWalletBalance = (type: string) => { const wallet = wallets.find((w: WalletCardType) => w.type === type); return wallet ? parseFloat(wallet.balance || "0") : 0; };
  const selectedFromExternal = externalForm.watch("fromWalletType");
  const transferType = settings ? settings?.find((s: any) => s.key === "TRANSFER_TYPE")?.value : "CROSSLINE";
  const isDownlineOnly = transferType === "DOWNLINE";
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("wallet.transferFunds")}</h1>
        <p className="text-muted-foreground">{t("wallet.transferToDownline")}</p>
      </div>
      {walletsLoading ? (<div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>) : (<WalletCards wallets={wallets} />)}
      <form onSubmit={externalForm.handleSubmit((data) => externalMutation.mutate(data))} className="bg-card rounded-lg p-6 space-y-4 max-w-md mx-auto">
        {userProfile?.isWithdrawalRestricted && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm"><AlertTriangle size={16} /><span>{t("wallet.transferLocked")}</span></div>
        )}
        {!userProfile?.isWithdrawalRestricted && isDownlineOnly && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm"><AlertTriangle size={16} /><span>{t("wallet.transfersOnlyDownline")}</span></div>
        )}
        <div className="space-y-2">
          <Label>{t("wallet.fromWallet")}</Label>
          <Select onValueChange={(v) => externalForm.setValue("fromWalletType", v)} value={selectedFromExternal}>
            <SelectTrigger><SelectValue placeholder={t("wallet.selectWallet")} /></SelectTrigger>
            <SelectContent>{walletTypes.map((type) => (<SelectItem key={type} value={type}>{walletConfig[type].label} (${getWalletBalance(type).toLocaleString()})</SelectItem>))}</SelectContent>
          </Select>
          {externalForm.formState.errors.fromWalletType && <p className="text-destructive text-sm">{externalForm.formState.errors.fromWalletType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{t("wallet.recipientMemberId")}</Label>
          <Input placeholder={t("wallet.enterMemberId")} {...externalForm.register("toMemberId")} />
          {externalForm.formState.errors.toMemberId && <p className="text-destructive text-sm">{externalForm.formState.errors.toMemberId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{t("common.amount")}</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...externalForm.register("amount")} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          {externalForm.formState.errors.amount && <p className="text-destructive text-sm">{externalForm.formState.errors.amount.message}</p>}
        </div>
        <Button type="submit" disabled={externalMutation.isPending || userProfile?.isWithdrawalRestricted} className="w-full">
          {externalMutation.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("wallet.processing")}</>) : userProfile?.isWithdrawalRestricted ? t("wallet.withdrawalsLocked") : t("wallet.transferToUser")}
        </Button>
      </form>
    </div>
  );
};

export default Transfer;
