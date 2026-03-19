import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Copy, Check, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface Change2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Change2FASetupData {
  otpauthUrl: string;
  base32: string;
  qr: string;
}

const Change2FAModal = ({ open, onOpenChange }: Change2FAModalProps) => {
  const [step, setStep] = useState<"verify" | "setup">("verify");
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [setupData, setSetupData] = useState<Change2FASetupData | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const initiateMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post("/auth/2fa/change/initiate", { code });
      return response.data;
    },
    onSuccess: (data) => {
      setSetupData(data);
      setStep("setup");
      setCurrentCode("");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post("/auth/2fa/change/confirm", { code });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "2FA updated successfully" });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStep("verify");
    setCurrentCode("");
    setNewCode("");
    setSetupData(null);
    setCopied(false);
    onOpenChange(false);
  };

  const handleCopySecret = async () => {
    if (setupData?.base32) {
      await navigator.clipboard.writeText(setupData.base32);
      setCopied(true);
      toast({ title: "Copied", description: "Secret key copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {step === "verify" ? "Verify Current 2FA" : "Set Up New 2FA"}
          </DialogTitle>
          <DialogDescription>
            {step === "verify"
              ? "Enter your current 6-digit 2FA code to proceed."
              : "Scan the QR code with your authenticator app and enter the new code."}
          </DialogDescription>
        </DialogHeader>

        {step === "verify" ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={currentCode}
                onChange={(value) => setCurrentCode(value)}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-12 text-center text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              onClick={() => initiateMutation.mutate(currentCode)}
              disabled={currentCode.length !== 6 || initiateMutation.isPending}
              className="w-full"
            >
              {initiateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* QR Code */}
            {setupData && (
              <>
                <div className="flex justify-center">
                  <div className="bg-foreground p-3 rounded-lg">
                    <img
                      src={setupData.qr}
                      alt="2FA QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-2">
                    Can't scan? Enter this key manually:
                  </p>
                  <div className="flex items-center justify-center gap-2 bg-muted border border-border rounded-lg p-3">
                    <code className="text-sm font-mono text-foreground break-all">
                      {setupData.base32}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="shrink-0 p-1.5 hover:bg-secondary rounded transition-colors"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* New code input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={newCode}
                onChange={(value) => setNewCode(value)}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-12 text-center text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={() => confirmMutation.mutate(newCode)}
              disabled={newCode.length !== 6 || confirmMutation.isPending}
              className="w-full"
            >
              {confirmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm & Update 2FA"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Change2FAModal;
