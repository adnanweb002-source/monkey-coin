import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface TransferToUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientMemberId?: string;
  recipientName?: string;
}

const TransferToUserModal = ({ 
  open, 
  onOpenChange, 
  recipientMemberId = "",
  recipientName = ""
}: TransferToUserModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await api.get("/wallets");
      return response.data;
    },
    enabled: open,
  });

  const form = useForm<ExternalFormData>({
    resolver: zodResolver(externalSchema),
    defaultValues: { fromWalletType: "", toMemberId: recipientMemberId, amount: "" },
  });

  // Update form when recipientMemberId changes
  useState(() => {
    if (recipientMemberId) {
      form.setValue("toMemberId", recipientMemberId);
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ExternalFormData) => {
      const response = await api.post("/wallet/transfer", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Transfer completed successfully" });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Transfer failed", 
        variant: "destructive" 
      });
    },
  });

  const walletTypes: WalletType[] = ["F_WALLET", "I_WALLET", "M_WALLET", "BONUS_WALLET"];

  const getWalletBalance = (type: string) => {
    const wallet = wallets.find((w: WalletCardType) => w.type === type);
    return wallet ? parseFloat(wallet.balance || "0") : 0;
  };

  const handleSubmit = (data: ExternalFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            {recipientName ? `Transfer funds to ${recipientName}` : "Transfer funds to user"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
            <AlertTriangle size={16} />
            <span>Transfers are only allowed to users in your downline</span>
          </div>

          <div className="space-y-2">
            <Label>From Wallet</Label>
            <Select 
              onValueChange={(v) => form.setValue("fromWalletType", v)} 
              value={form.watch("fromWalletType")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {walletConfig[type].label} (${getWalletBalance(type).toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.fromWalletType && (
              <p className="text-destructive text-sm">{form.formState.errors.fromWalletType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Recipient Member ID</Label>
            <Input 
              placeholder="Enter member ID" 
              {...form.register("toMemberId")}
              defaultValue={recipientMemberId}
            />
            {form.formState.errors.toMemberId && (
              <p className="text-destructive text-sm">{form.formState.errors.toMemberId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              {...form.register("amount")} 
            />
            {form.formState.errors.amount && (
              <p className="text-destructive text-sm">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Transfer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferToUserModal;
