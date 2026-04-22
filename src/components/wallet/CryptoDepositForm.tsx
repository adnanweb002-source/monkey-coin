import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2, Bitcoin } from "lucide-react";

interface CryptoDepositResponse {
  depositId: string;
  paymentId: string;
  currency: string;
  address: string;
  amountCrypto: string;
  amountFiat: string;
  uri: string;
  expiresAt: string;
}

interface CryptoDepositFormProps {
  onDepositCreated: (data: CryptoDepositResponse) => void;
}

const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDTTRC20", label: "Tether (USDT TRC20)" },
  { value: "LTC", label: "Litecoin (LTC)" },
  { value: "USDTERC20", label: "USDT ERC20" },
  { value: "USDTBSC", label: "USDT BEP20" },
  { value: "DOGE", label: "Dogecoin (DOGE)" },
  { value: "TRX", label: "Tron (TRX)" },
];

const CryptoDepositForm = ({ onDepositCreated }: CryptoDepositFormProps) => {
  const [amount, setAmount] = useState("");
  const [crypto, setCrypto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!crypto) {
      toast({
        title: "Select payment method",
        description: "Please select a payment method to proceed",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<CryptoDepositResponse>("/wallet/deposit/crypto", {
        amount,
        crypto,
      });

      onDepositCreated(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to create crypto deposit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          Deposit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="Enter amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crypto">Method *</Label>
            <Select value={crypto} onValueChange={setCrypto}>
              <SelectTrigger>
                <SelectValue placeholder="Method of payment" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !amount || !crypto}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Deposit...
              </>
            ) : (
              "Generate Payment QR"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CryptoDepositForm;
