import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Shield, Wallet } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mintWalletAdjustChallenge } from "@/lib/adminWalletAdjustChallenge";

type WalletType = "D_WALLET" | "E_WALLET" | "P_WALLET" | "A_WALLET";
type AdjustDirection = "CREDIT" | "DEBIT";

interface MemberLookup {
  id: number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: "USER" | "ADMIN";
}

interface AdjustResponse {
  ok: boolean;
  memberId: string;
  walletType: WalletType;
  beforeBalance: string;
  balanceAfter: string;
  adjustmentDirection?: "CREDIT" | "DEBIT";
  adjustmentAmount?: string;
  txNumber?: string;
  message?: string;
}

const walletTypeOptions: { label: string; value: WalletType }[] = [
  { label: "Deposit Wallet", value: "D_WALLET" },
  { label: "Earnings Wallet", value: "E_WALLET" },
  { label: "Passive Wallet", value: "P_WALLET" },
  { label: "Awards Wallet", value: "A_WALLET" },
];

const AdminWalletBalanceAdjust = () => {
  const { toast } = useToast();
  const profileRaw = localStorage.getItem("userProfile");
  const isAdmin = profileRaw ? JSON.parse(profileRaw)?.role === "ADMIN" : false;
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState<MemberLookup | null>(null);
  const [isLookingUpMember, setIsLookingUpMember] = useState(false);

  const [walletType, setWalletType] = useState<WalletType>("D_WALLET");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<AdjustDirection>("CREDIT");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [reason, setReason] = useState("");

  const [lastResult, setLastResult] = useState<AdjustResponse | null>(null);

  const lookupMemberByMemberId = async () => {
    const sanitized = memberId.trim();
    if (!sanitized) {
      setMember(null);
      return;
    }

    setIsLookingUpMember(true);
    try {
      const params = new URLSearchParams({
        take: "1",
        skip: "0",
        memberId: sanitized,
      });
      const response = await api.get(`/admin/users/list?${params.toString()}`);
      const users = response.data?.users || [];
      const exact = users.find(
        (u: MemberLookup) => String(u.memberId).toLowerCase() === sanitized.toLowerCase(),
      );
      const resolved = exact || users[0];

      if (!resolved) {
        setMember(null);
        toast({
          title: "Member not found",
          description: "No user found for this Member ID.",
          variant: "destructive",
        });
        return;
      }

      setMember(resolved);
    } catch (error: any) {
      setMember(null);
      toast({
        title: "Lookup failed",
        description: error.response?.data?.message || "Unable to fetch member details.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUpMember(false);
    }
  };

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const mid = memberId.trim();
      const signing = await mintWalletAdjustChallenge(mid);

      const payload = {
        memberId: mid,
        walletType,
        amount: amount.trim(),
        direction,
        twoFactorCode: twoFactorCode.trim(),
        keySalt: signing.keySalt,
        requestTs: signing.requestTs,
        dynamicKey: signing.dynamicKey,
        reason: reason.trim() || undefined,
      };
      const response = await api.post("/admin/wallets/adjust-balance", payload);
      return response.data as AdjustResponse;
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast({
        title: "Balance adjusted",
        description: data.message || `Wallet updated for ${data.memberId}.`,
      });
      setTwoFactorCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Adjustment failed",
        description: error.response?.data?.message || "Could not adjust wallet balance.",
        variant: "destructive",
      });
    },
  });

  const validateAndSubmit = () => {
    if (!memberId.trim()) {
      toast({ title: "Validation error", description: "Member ID is required.", variant: "destructive" });
      return;
    }
    if (!amount.trim()) {
      toast({ title: "Validation error", description: "Adjustment amount is required.", variant: "destructive" });
      return;
    }
    const amt = Number(amount.trim());
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: "Validation error",
        description: "Amount must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    if (!twoFactorCode.trim()) {
      toast({
        title: "Validation error",
        description: "Admin 2FA code is required.",
        variant: "destructive",
      });
      return;
    }
    adjustMutation.mutate();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Access denied</CardTitle>
            <CardDescription>This page is available to admins only.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Wallet Balance Adjustment</h1>
        <p className="text-muted-foreground">
          Credit or debit a member wallet by amount. This action is audited and restricted to admins.
        </p>
      </div>

      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            High-impact action
          </CardTitle>
          <CardDescription>
            Use only for verified correction cases. Always include an internal reason for audit clarity.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Adjustment Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID *</Label>
                <Input
                  id="memberId"
                  placeholder="Enter member id and blur"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  onBlur={lookupMemberByMemberId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletType">Wallet Type *</Label>
                <select
                  id="walletType"
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as WalletType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {walletTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <select
                  id="direction"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as AdjustDirection)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="CREDIT">Credit (add to balance)</option>
                  <option value="DEBIT">Debit (subtract from balance)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 120.50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">Admin 2FA Code *</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Enter current 2FA code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional but recommended)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for this admin adjustment"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={validateAndSubmit} disabled={adjustMutation.isPending || isLookingUpMember}>
                {adjustMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  "Adjust Wallet Balance"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 xl:sticky xl:top-6">
          <Card className={member ? "animate-in fade-in-0 slide-in-from-right-3 duration-300" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Member Details
              </CardTitle>
              <CardDescription>Auto-loaded after Member ID blur.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLookingUpMember ? (
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Looking up member...
                </div>
              ) : member ? (
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Member ID:</span> <span className="font-mono">{member.memberId}</span></div>
                  <div><span className="text-muted-foreground">Name:</span> {member.firstName} {member.lastName}</div>
                  <div><span className="text-muted-foreground">Email:</span> {member.email || "-"}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{member.status}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No member loaded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className={lastResult ? "border-green-500/30 bg-green-500/5 animate-in fade-in-0 slide-in-from-right-3 duration-300" : ""}>
            <CardHeader>
              <CardTitle>Latest Adjustment Result</CardTitle>
            </CardHeader>
            <CardContent>
              {lastResult ? (
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Member ID:</span> {lastResult.memberId}</div>
                  <div><span className="text-muted-foreground">Wallet:</span> {lastResult.walletType}</div>
                  <div><span className="text-muted-foreground">Before:</span> {lastResult.beforeBalance}</div>
                  <div><span className="text-muted-foreground">After:</span> {lastResult.balanceAfter}</div>
                  <div><span className="text-muted-foreground">Direction:</span> {lastResult.adjustmentDirection || "-"}</div>
                  <div><span className="text-muted-foreground">Amount:</span> {lastResult.adjustmentAmount || "-"}</div>
                  <div className="break-all"><span className="text-muted-foreground">Tx Number:</span> {lastResult.txNumber || "-"}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No adjustment response yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminWalletBalanceAdjust;
