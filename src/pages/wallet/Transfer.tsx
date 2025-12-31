import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import WalletCards from "@/components/dashboard/WalletCards";
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
import { useToast } from "@/hooks/use-toast";
import { walletConfig } from "@/lib/config";
import { Loader2, AlertTriangle } from "lucide-react";
import type { WalletCard as WalletCardType } from "@/types/wallet";

type WalletType = "F_WALLET" | "I_WALLET" | "M_WALLET" | "BONUS_WALLET";

const externalSchema = z.object({
  fromWalletType: z.string().min(1, "Select wallet"),
  toMemberId: z.string().min(1, "Member ID is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
});

type ExternalFormData = z.infer<typeof externalSchema>;

const Transfer = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await api.get("/wallets");
      return response.data;
    },
  });

  const externalForm = useForm<ExternalFormData>({
    resolver: zodResolver(externalSchema),
    defaultValues: { fromWalletType: "", toMemberId: "", amount: "" },
  });

  const externalMutation = useMutation({
    mutationFn: async (data: ExternalFormData) => {
      const response = await api.post("/wallet/transfer", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Transfer to user completed successfully" });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      externalForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Transfer failed", variant: "destructive" });
    },
  });

  const walletTypes: WalletType[] = ["F_WALLET", "I_WALLET", "M_WALLET", "BONUS_WALLET"];

  const getWalletBalance = (type: string) => {
    const wallet = wallets.find((w: WalletCardType) => w.type === type);
    return wallet ? parseFloat(wallet.balance || "0") : 0;
  };

  const selectedFromExternal = externalForm.watch("fromWalletType");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transfer Funds</h1>
        <p className="text-muted-foreground">Transfer funds to another user in your downline</p>
      </div>

      {walletsLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
      ) : (
        <WalletCards wallets={wallets} />
      )}

      <form onSubmit={externalForm.handleSubmit((data) => externalMutation.mutate(data))} className="bg-card rounded-lg p-6 space-y-4 max-w-md">
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
          <AlertTriangle size={16} />
          <span>Transfers are only allowed to users in your downline</span>
        </div>

        <div className="space-y-2">
          <Label>From Wallet</Label>
          <Select onValueChange={(v) => externalForm.setValue("fromWalletType", v)} value={selectedFromExternal}>
            <SelectTrigger><SelectValue placeholder="Select wallet" /></SelectTrigger>
            <SelectContent>
              {walletTypes.map((type) => (
                <SelectItem key={type} value={type}>{walletConfig[type].label} (${getWalletBalance(type).toLocaleString()})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {externalForm.formState.errors.fromWalletType && <p className="text-destructive text-sm">{externalForm.formState.errors.fromWalletType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Recipient Member ID</Label>
          <Input placeholder="Enter member ID" {...externalForm.register("toMemberId")} />
          {externalForm.formState.errors.toMemberId && <p className="text-destructive text-sm">{externalForm.formState.errors.toMemberId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...externalForm.register("amount")} />
          {externalForm.formState.errors.amount && <p className="text-destructive text-sm">{externalForm.formState.errors.amount.message}</p>}
        </div>

        <Button type="submit" disabled={externalMutation.isPending} className="w-full">
          {externalMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Transfer to User"}
        </Button>
      </form>
    </div>
  );
};

export default Transfer;
