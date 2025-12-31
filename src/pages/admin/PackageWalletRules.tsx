import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Save, Settings } from "lucide-react";
import { walletConfig } from "@/lib/config";

type WalletType = "F_WALLET" | "I_WALLET" | "M_WALLET" | "BONUS_WALLET";

interface WalletRule {
  wallet: WalletType;
  minPct: number;
}

const PackageWalletRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  const { data: rules = [], isLoading } = useQuery<WalletRule[]>({
    queryKey: ["walletRules"],
    queryFn: async () => {
      const response = await api.get("/packages/wallet-rules");
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { wallet: WalletType; minPct: number }) => {
      const response = await api.post("/packages-wallet-rules", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet rule updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["walletRules"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update rule",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (wallet: WalletType, value: string) => {
    // Only allow numeric values
    const numericValue = value.replace(/[^0-9.]/g, "");
    setEditingValues((prev) => ({
      ...prev,
      [wallet]: numericValue,
    }));
  };

  const handleSave = (wallet: WalletType) => {
    const value = editingValues[wallet];
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || numericValue < 0) {
      toast({
        title: "Invalid Value",
        description: "Minimum percentage must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({ wallet, minPct: numericValue });
  };

  const getEditValue = (rule: WalletRule) => {
    if (editingValues[rule.wallet] !== undefined) {
      return editingValues[rule.wallet];
    }
    return rule.minPct.toString();
  };

  const getWalletLabel = (wallet: WalletType) => {
    return walletConfig[wallet]?.label || wallet;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Package Wallet Rules</h1>
        <p className="text-muted-foreground">
          Configure minimum percentage allocation rules for each wallet type
        </p>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Wallet Allocation Rules
          </CardTitle>
          <CardDescription>
            Set the minimum percentage users must allocate to each wallet during package purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet Type</TableHead>
                <TableHead>Minimum % Allocation</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.wallet}>
                  <TableCell className="font-medium">
                    {getWalletLabel(rule.wallet)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={getEditValue(rule)}
                        onChange={(e) => handleInputChange(rule.wallet, e.target.value)}
                        className="w-24"
                        placeholder="0"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleSave(rule.wallet)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No wallet rules configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rules.map((rule) => (
          <Card key={rule.wallet}>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {getWalletLabel(rule.wallet)}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Minimum % Allocation
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={getEditValue(rule)}
                    onChange={(e) => handleInputChange(rule.wallet, e.target.value)}
                    className="flex-1"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleSave(rule.wallet)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No wallet rules configured
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PackageWalletRules;
