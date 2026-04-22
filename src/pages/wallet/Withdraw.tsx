import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloudCog, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { ApiWallet } from "@/types/wallet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const Withdraw = () => {
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [selectedWalletType, setSelectedWalletType] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [wallet, setWallet] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isTargetLocked, setIsTargetLocked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: userWallets = [], isLoading: walletsLoading } = useQuery<
    UserExternalWallet[]
  >({
    queryKey: ["myExternalWallets"],
    queryFn: async () => {
      const response = await api.get("/wallet/my-external-wallets");
      return response.data;
    },
  });

  const getUserWallet = (supportedId: number): UserExternalWallet | undefined =>
    userWallets.find((w) => w.supportedWalletId === supportedId);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await api.get("/wallet/user-wallets");
        setWallets(response.data || []);
      } catch (error: any) {
        toast({
          title: t("common.error"),
          description:
            error?.response?.data?.message || "Failed to fetch wallets",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };
    fetchWallets();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      if (profile?.lockWithdrawalsTillTarget) setIsTargetLocked(true);
    }
  }, []);

  const selectedWallet = wallets.find((w) => w.type === selectedWalletType);
  const selectedBalance = selectedWallet
    ? parseFloat(selectedWallet.balance)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletType) {
      toast({
        title: t("common.error"),
        description: t("wallet.selectWalletError"),
        variant: "destructive",
      });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: t("wallet.invalidAmount"),
        description: t("wallet.invalidAmountDescription"),
        variant: "destructive",
      });
      return;
    }
    if (parseFloat(amount) > selectedBalance) {
      toast({
        title: t("wallet.insufficientBalance"),
        description: t("wallet.insufficientBalanceDesc", {
          wallet: selectedWalletType,
        }),
        variant: "destructive",
      });
      return;
    }
    if (!method) {
      toast({
        title: t("common.error"),
        description: t("wallet.selectMethodError"),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).id : null;
      const response = await api.post("/wallet/withdraw", {
        userId,
        walletType: selectedWalletType,
        amount,
        method,
        ...(address && { address }),
      });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: t("wallet.withdrawalRequestSubmitted"),
        description: t("wallet.withdrawalRequestSuccess"),
      });
      setShowSuccess(true)
      setSuccessData(response.data)
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error?.response?.data?.message ||
          "Failed to submit withdrawal request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const walletLabels: Record<string, string> = {
    D_WALLET: "D Wallet",
    P_WALLET: "P Wallet",
    E_WALLET: "E Wallet",
    A_WALLET: "A Wallet",
  };
  const userProfile = localStorage.getItem("userProfile");
  const user = userProfile ? JSON.parse(userProfile) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("wallet.withdrawFunds")}
      </h1>

      {isTargetLocked && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
          <CloudCog className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            <strong>{t("wallet.withdrawalsLocked")}:</strong>{" "}
            {t("wallet.withdrawalsLockedMessage")}
          </p>
        </div>
      )}

      {user?.isWithdrawalRestricted && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
          <CloudCog className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            <strong>{t("wallet.withdrawalsLocked")}</strong>
          </p>
        </div>
      )}

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("wallet.withdrawalForm")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWallets ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">
                  {t("wallet.selectWalletRequired")}
                </Label>
                <Select
                  value={selectedWalletType}
                  onValueChange={setSelectedWalletType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("wallet.selectAWallet")} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets
                      .filter(
                        (wallet) =>
                          wallet.type !== "A_WALLET" &&
                          wallet.type !== "D_WALLET",
                      )
                      .map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.type}
                          disabled={parseFloat(wallet.balance) <= 0}
                        >
                          {walletLabels[wallet.type] || wallet.type} - $
                          {parseFloat(wallet.balance).toLocaleString()}
                          {parseFloat(wallet.balance) <= 0 &&
                            ` (${t("wallet.noBalance")})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedWallet && (
                  <p className="text-sm text-muted-foreground">
                    {t("wallet.availableBalance")}: $
                    {selectedBalance.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t("wallet.amountRequired")}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={t("wallet.enterAmount")}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="20"
                  step="0.01"
                  max={selectedBalance}
                  required
                />
                {parseFloat(amount) < 20 && (
                  <p className="text-sm text-destructive">
                    {t("wallet.amountMinimum")}
                  </p>
                )}
                {parseFloat(amount) > selectedBalance && selectedWallet && (
                  <p className="text-sm text-destructive">
                    {t("wallet.amountExceedsBalance")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">{t("wallet.withdrawalMethod")}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("wallet.selectMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT_TRC_20">USDT (TRC20)</SelectItem>
                    <SelectItem value="USDT_BEP_20">USDT (BEP20)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("wallet.withdrawalAddress")}</Label>
                <Select value={address} onValueChange={setAddress}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("wallet.selectWithdrawalAddress")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {userWallets.map((w) => (
                      <SelectItem key={w.id} value={w.address}>
                        {w.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  isTargetLocked ||
                  !selectedWalletType ||
                  user?.isWithdrawalRestricted ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > selectedBalance ||
                  !method
                }
                className="w-full"
                size="lg"
              >
                {isTargetLocked
                  ? t("wallet.withdrawalsLocked")
                  : isLoading
                    ? t("wallet.submitting")
                    : user?.isWithdrawalRestricted
                      ? t("wallet.withdrawalsLocked")
                      : t("wallet.submitWithdrawal")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              🎉{ t("wallet.withdrawalRequestSubmitted")}
            </DialogTitle>
            <DialogDescription>
             {t("wallet.withdrawalRequestSuccess")}
            </DialogDescription>
          </DialogHeader>

          {successData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium">{successData.transactionId}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccess(false);
                navigate("/wallet/withdraw-requests");
              }}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Withdraw;
