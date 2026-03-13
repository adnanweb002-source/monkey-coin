import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import FloatingCoins from "@/components/FloatingCoins";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

const schema = z.object({
  email: z.string().trim(),
});

type FormData = z.infer<typeof schema>;

const Request2FAReset = () => {
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
      await api.post("/auth/request-2fa-reset", { email: data.email });
      setSubmitted(true);
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const logo = theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  return (
    <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
      <FloatingCoins />
      <div className="flex-1 flex items-center justify-center">
        <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
          <div className="text-center mb-8">
            <img src={logo} alt="Vaultire Infinite" className="h-20 mx-auto mb-4" />
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset 2FA</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email or member ID to receive a 2FA reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Mail className="text-primary" size={28} />
              </div>
              <p className="text-foreground font-medium">Check your email</p>
              <p className="text-muted-foreground text-sm">
                If the email exists, a reset link has been sent.
              </p>
              <Link to="/signin" className="crypto-link text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="crypto-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="crypto-input"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button type="submit" disabled={isLoading} className="crypto-button w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send 2FA Reset Link"
                )}
              </button>

              <p className="text-center text-muted-foreground text-sm">
                Remember your 2FA code?{" "}
                <Link to="/signin" className="crypto-link">Sign In</Link>
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

export default Request2FAReset;
