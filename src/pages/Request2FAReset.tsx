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
import { useTranslation } from "react-i18next";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  memberId: z.string({ required_error: "This field is required" }).trim(),
});
type FormData = z.infer<typeof schema>;

const Request2FAReset = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try { await api.post("/auth/request-2fa-reset", { email: data.email, memberId: data.memberId }); setSubmitted(true); }
    catch (error) { toast({ title: t("common.error"), description: getErrorMessage(error), variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const logo = theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  return (
    <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
      <FloatingCoins />
      <div className="flex-1 flex items-center justify-center">
        <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
          <div className="text-center mb-8">
            <img src={logo} alt="Vaultire Infinite" className="h-20 mx-auto mb-4" />
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"><Shield className="text-primary" size={24} /></div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.reset")} 2FA</h1>
            <p className="text-muted-foreground text-sm">{t("auth.enterEmailForReset")}</p>
          </div>
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto"><Mail className="text-primary" size={28} /></div>
              <p className="text-foreground font-medium">{t("auth.checkYourEmail")}</p>
              <p className="text-muted-foreground text-sm">{t("auth.resetLinkSent")}</p>
              <Link to="/signin" className="crypto-link text-sm">{t("auth.backToSignIn")}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="crypto-label">{t("auth.emailAddress")}</label>
                <input id="email" type="email" {...register("email")} className="crypto-input" placeholder={t("auth.enterEmailAddress")} required />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                <label htmlFor="memberId" className="crypto-label">{t("auth.memberId")}</label>
                <input id="memberId" type="text" {...register("memberId")} className="crypto-input" placeholder={t("auth.memberId")} required />
                {errors.memberId && <p className="text-destructive text-xs mt-1">{errors.memberId.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="crypto-button w-full">
                {isLoading ? <div className="flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={18} /><span>{t("auth.sending")}</span></div> : t("auth.sendResetLink")}
              </button>
              <p className="text-center text-muted-foreground text-sm">{t("auth.rememberPassword")} <Link to="/signin" className="crypto-link">{t("auth.signIn")}</Link></p>
              <div className="pt-2 text-center">
                <Link to="/2fa-reset-request-for-admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">{t("auth.noEmailAccess")}</Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Vaultire Infinite | {t("common.allRightsReserved")}</footer>
    </div>
  );
};

export default Request2FAReset;
