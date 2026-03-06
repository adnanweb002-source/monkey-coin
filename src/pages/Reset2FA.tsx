import { useState } from "react";
import { useTheme } from "next-themes";
import { Loader2, AlertTriangle, CheckCircle, ShieldOff } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import FloatingCoins from "@/components/FloatingCoins";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

const Reset2FA = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const logo = theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-crypto flex items-center justify-center relative overflow-hidden">
        <FloatingCoins />
        <div className="crypto-card w-full max-w-md mx-4 p-8 z-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="text-destructive" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm">
            This 2FA reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/request-2fa-reset" className="crypto-link text-sm">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-2fa", { email, token });
      setSuccess(true);
      toast({ title: "Success", description: "Two-factor authentication has been disabled successfully." });
      setTimeout(() => navigate("/signin"), 3000);
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center relative overflow-hidden">
      <FloatingCoins />
      <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
        <div className="text-center mb-8">
          <img src={logo} alt="Vaultire Infinite" className="h-20 mx-auto mb-4" />
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="text-primary" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset 2FA</h1>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle className="text-primary" size={28} />
            </div>
            <p className="text-foreground font-medium">2FA Disabled Successfully</p>
            <p className="text-muted-foreground text-sm">
              Two-factor authentication has been disabled. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-foreground text-sm">
                <strong>Warning:</strong> This action will disable two-factor authentication on your account.
                You can re-enable it later from your security settings.
              </p>
            </div>

            <button onClick={handleReset} disabled={isLoading} className="crypto-button w-full">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>Disabling 2FA...</span>
                </div>
              ) : (
                "Confirm & Disable 2FA"
              )}
            </button>

            <p className="text-center text-muted-foreground text-sm">
              Changed your mind?{" "}
              <Link to="/signin" className="crypto-link">Back to Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reset2FA;
