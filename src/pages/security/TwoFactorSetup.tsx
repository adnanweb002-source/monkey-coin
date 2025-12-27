import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Copy, Check, Smartphone, Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import FloatingCoins from "@/components/FloatingCoins";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface TwoFactorSetupData {
  otpauthUrl: string;
  base32: string;
  qr: string;
}

const TwoFactorSetup = () => {
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch 2FA setup data on mount
  useEffect(() => {
    const initSetup = async () => {
      try {
        const response = await api.post("/auth/2fa/setup");
        setSetupData(response.data);
      } catch (error) {
        toast({
          title: "Setup Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initSetup();
  }, [toast]);

  // Verify 2FA code mutation
  const verifyMutation = useMutation({
    mutationFn: async (verifyCode: string) => {
      const response = await api.post("/auth/2fa/verify", { code: verifyCode });
      return response.data;
    },
    onSuccess: () => {
      // Update local profile to reflect 2FA enabled
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.isG2faEnabled = true;
        localStorage.setItem("userProfile", JSON.stringify(profile));
      }

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleCopySecret = async () => {
    if (setupData?.base32) {
      await navigator.clipboard.writeText(setupData.base32);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingCoins />

      <div className="crypto-card w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Secure Your Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Two-factor authentication is required to access your account
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Setting up 2FA...</p>
          </div>
        ) : setupData ? (
          <div className="space-y-6">
            {/* Step 1: Download App */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Download Authenticator App
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Install one of these apps on your phone:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Smartphone size={14} />
                      Google Authenticator
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.authy.authy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Smartphone size={14} />
                      Authy
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Scan QR */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Scan QR Code
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Open your authenticator app and scan the QR code below
                  </p>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-foreground p-3 rounded-lg">
                      <img
                        src={setupData.qr}
                        alt="2FA QR Code"
                        className="w-40 h-40 md:w-48 md:h-48"
                      />
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs mb-2">
                      Can't scan? Enter this key manually:
                    </p>
                    <div className="flex items-center justify-center gap-2 bg-input border border-border rounded-lg p-3">
                      <code className="text-sm font-mono text-foreground break-all">
                        {setupData.base32}
                      </code>
                      <button
                        onClick={handleCopySecret}
                        className="shrink-0 p-1.5 hover:bg-secondary rounded transition-colors"
                        title="Copy secret key"
                      >
                        {copied ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Enter Code */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Verify Setup
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Enter the 6-digit code from your authenticator app
                  </p>

                  <div className="flex justify-center mb-4">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => setCode(value)}
                    >
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="crypto-input w-10 h-12 md:w-12 md:h-14 text-center text-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={code.length !== 6 || verifyMutation.isPending}
                    className="crypto-button w-full"
                  >
                    {verifyMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Enable 2FA"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to initialize 2FA setup</p>
            <button
              onClick={() => window.location.reload()}
              className="crypto-button"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
