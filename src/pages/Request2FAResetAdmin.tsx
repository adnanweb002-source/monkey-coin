import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Shield, Info, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import FloatingCoins from "@/components/FloatingCoins";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  memberId: z.string().trim().min(1, "Member ID is required"),
});

type FormData = z.infer<typeof schema>;

const Request2FAResetAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/request-2fa-reset-by-admin", {
        email: data.email,
        memberId: data.memberId,
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logo =
    theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  return (
    <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
      <FloatingCoins />
      <div className="flex-1 flex items-center justify-center">
        <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Vaultire Infinite"
              className="h-20 mx-auto mb-4"
            />
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Request 2FA Reset
            </h1>
            <p className="text-muted-foreground text-sm">
              If you've lost access to your authenticator or email, submit a request for manual review.
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle className="text-primary" size={28} />
              </div>
              <p className="text-foreground font-medium">Request Submitted</p>
              <p className="text-muted-foreground text-sm">
                Your request has been submitted. Our team will review and contact you if needed.
              </p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border text-left">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Manual verification may take 24–48 hours.
                </p>
              </div>
              <Link to="/signin" className="crypto-link text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Manual verification may take 24–48 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="crypto-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="crypto-input"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="memberId" className="crypto-label">
                    Member ID
                  </label>
                  <input
                    id="memberId"
                    type="text"
                    {...register("memberId")}
                    className="crypto-input"
                    placeholder="Enter your Member ID"
                  />
                  {errors.memberId && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.memberId.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="crypto-button w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Request"
                )}
              </button>

              <p className="text-center text-muted-foreground text-sm">
                Still have email access?{" "}
                <Link to="/request-2fa-reset" className="crypto-link">
                  Reset via Email
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vaultire Infinite | All Rights Reserved
      </footer>
    </div>
  );
};

export default Request2FAResetAdmin;
