import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import FloatingCoins from "@/components/FloatingCoins";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useTranslation } from "react-i18next";

const schema = z.object({ newPassword: z.string().min(8, "Password must be at least 8 characters"), confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const logo = theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
        <FloatingCoins />
        <div className="flex-1 flex items-center justify-center">
          <div className="crypto-card w-full max-w-md mx-4 p-8 z-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto"><AlertTriangle className="text-destructive" size={28} /></div>
            <h1 className="text-2xl font-bold text-foreground">{t("auth.invalidResetLink")}</h1>
            <p className="text-muted-foreground text-sm">{t("auth.resetLinkExpired")}</p>
            <Link to="/forgot-password" className="crypto-link text-sm">{t("auth.requestNewLink")}</Link>
          </div>
        </div>
        <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Vaultire Infinite | {t("common.allRightsReserved")}</footer>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, token, newPassword: data.newPassword });
      setSuccess(true);
      toast({ title: t("common.success"), description: t("auth.passwordResetSuccessful") });
      setTimeout(() => navigate("/panel/signin"), 3000);
    } catch (error) { toast({ title: t("common.error"), description: getErrorMessage(error), variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
      <FloatingCoins />
      <div className="flex-1 flex items-center justify-center">
        <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
          <div className="text-center mb-8">
            <img src={logo} alt="Vaultire Infinite" className="h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.resetPassword")}</h1>
            <p className="text-muted-foreground text-sm">{t("auth.enterNewPassword")}</p>
          </div>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto"><CheckCircle className="text-primary" size={28} /></div>
              <p className="text-foreground font-medium">{t("auth.passwordResetSuccessful")}</p>
              <p className="text-muted-foreground text-sm">{t("auth.redirectingToSignIn")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="crypto-label">{t("auth.newPassword")}</label>
                <div className="relative">
                  <input id="newPassword" type={showPassword ? "text" : "password"} {...register("newPassword")} className="crypto-input pr-10" placeholder={t("auth.enterNewPasswordPlaceholder")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="crypto-label">{t("auth.confirmNewPassword")}</label>
                <div className="relative">
                  <input id="confirmPassword" type={showConfirm ? "text" : "password"} {...register("confirmPassword")} className="crypto-input pr-10" placeholder={t("auth.confirmNewPassword")} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="crypto-button w-full">
                {isLoading ? <div className="flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={18} /><span>{t("auth.resetting")}</span></div> : t("auth.resetPassword")}
              </button>
            </form>
          )}
        </div>
      </div>
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Vaultire Infinite | {t("common.allRightsReserved")}</footer>
    </div>
  );
};

export default ResetPassword;
