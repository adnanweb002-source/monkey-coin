import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloudCog, Wallet } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

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
  const [selectedWalletType, setSelectedWalletType] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [wallet, setWallet] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { data: userWallets = [], isLoading: walletsLoading } = useQuery<
    UserExternalWallet[]
  >({
    queryKey: ["myExternalWallets"],
    queryFn: async () => {
      const response = await api.get("/wallet/my-external-wallets");
      return response.data;
    },
  });

  const getUserWallet = (
    supportedId: number,
  ): UserExternalWallet | undefined => {
    return userWallets.find((w) => w.supportedWalletId === supportedId);
  };

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await api.get("/wallet/user-wallets");
        setWallets(response.data || []);
      } catch (error: any) {
        toast({
          title: "Error",
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

  const selectedWallet = wallets.find((w) => w.type === selectedWalletType);
  const selectedBalance = selectedWallet
    ? parseFloat(selectedWallet.balance)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWalletType) {
      toast({
        title: "Error",
        description: "Please select a wallet",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > selectedBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your ${selectedWalletType} balance is insufficient`,
        variant: "destructive",
      });
      return;
    }

    if (!method) {
      toast({
        title: "Error",
        description: "Please select a withdrawal method",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = localStorage.getItem("userProfile");
      const userId = userProfile ? JSON.parse(userProfile).id : null;

      await api.post("/wallet/withdraw", {
        userId,
        walletType: selectedWalletType,
        amount,
        method,
        ...(address && { address }),
      });

      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted successfully.",
      });

      navigate("/wallet/withdraw-requests");
    } catch (error: any) {
      toast({
        title: "Error",
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
    F_WALLET: "D Wallet",
    I_WALLET: "P Wallet",
    M_WALLET: "E Wallet",
    BONUS_WALLET: "A Wallet",
  };

  console.log(wallets);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Withdraw Funds</h1>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Withdrawal Form
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
                <Label htmlFor="wallet">Select Wallet *</Label>
                <Select
                  value={selectedWalletType}
                  onValueChange={setSelectedWalletType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets
                      .filter(
                        (wallet) =>
                          wallet.type !== "BONUS_WALLET" &&
                          wallet.type !== "F_WALLET",
                      )
                      .map((wallet) => (
                        <SelectItem
                          key={wallet.id}
                          value={wallet.type}
                          disabled={parseFloat(wallet.balance) <= 0}
                        >
                          {walletLabels[wallet.type] || wallet.type} - $
                          {parseFloat(wallet.balance).toLocaleString()}
                          {parseFloat(wallet.balance) <= 0 && " (No balance)"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedWallet && (
                  <p className="text-sm text-muted-foreground">
                    Available balance: ${selectedBalance.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
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
                    Amount must be at least $20
                  </p>
                )}
                {parseFloat(amount) > selectedBalance && selectedWallet && (
                  <p className="text-sm text-destructive">
                    Amount exceeds available balance
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Withdrawal Method *</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT_TRC_20" key="USDT_TRC_20">USDT (TRC20)</SelectItem>
                    <SelectItem value="USDT_ERC_20" key="USDT_ERC_20">USDT (ERC20)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Withdrawal Address</Label>
                <Select value={wallet} onValueChange={setWallet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select withdrawal Address" />
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
                  !selectedWalletType ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > selectedBalance ||
                  !method
                }
                className="w-full"
                size="lg"
              >
                {isLoading ? "Submitting..." : "Submit Withdrawal"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdraw;
