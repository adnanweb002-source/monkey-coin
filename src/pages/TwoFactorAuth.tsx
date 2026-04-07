import FloatingCoins from "@/components/FloatingCoins";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      // const response = await fetch('/api/auth/verify-2fa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ otp }),
      // });
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/success");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-dark via-crypto-darker to-crypto-dark flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingCoins />
      
      <div className="crypto-card w-full max-w-md p-8 relative z-10">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          Google 2FA
        </h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="crypto-label">Enter 2FA OTP</label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                className="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="crypto-input w-12 h-12 text-center text-lg" />
                  <InputOTPSlot index={1} className="crypto-input w-12 h-12 text-center text-lg" />
                  <InputOTPSlot index={2} className="crypto-input w-12 h-12 text-center text-lg" />
                  <InputOTPSlot index={3} className="crypto-input w-12 h-12 text-center text-lg" />
                  <InputOTPSlot index={4} className="crypto-input w-12 h-12 text-center text-lg" />
                  <InputOTPSlot index={5} className="crypto-input w-12 h-12 text-center text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.length !== 6}
            className="crypto-button w-full"
          >
            {isLoading ? "Verifying..." : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
