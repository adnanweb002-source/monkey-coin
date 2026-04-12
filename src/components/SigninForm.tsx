import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { getErrorMessage } from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useTranslation } from "react-i18next";

const signinSchema = z.object({
  email: z.string().min(4, "Email is required"),
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(),
  rememberMe: z.boolean().optional(),
});
type SigninFormData = z.infer<typeof signinSchema>;

const SigninForm = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { rememberMe: false, code: "" },
  });

  const handleOtpChange = (value: string) => { setOtpValue(value); setValue("code", value); };

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    try {
      const payload: Record<string, string> = { phoneOrEmail: data.email, password: data.password };
      if (otpValue && otpValue.length > 0) payload.code = otpValue;
      const response = await api.post("/auth/login", payload);
      if (!response?.data?.ok) throw new Error("Login failed. Please try again.");
      const profileResponse = await api.get("/auth/get-profile");
      const userProfile = profileResponse?.data;
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      if (userProfile?.role == "ADMIN") {
        toast({ title: "Admin Login Detected", description: "You have been signed in successfully." });
        if (import.meta.env.VITE_ENVIRONMENT === "production") { window.location.href = import.meta.env.VITE_ADMIN_URL + "panel"; } else { navigate("/panel"); }
      } else {
        toast({ title: t("common.success"), description: "You have been signed in successfully." });
        navigate("/panel");
      }
    } catch (error) {
      toast({ title: t("common.error"), description: getErrorMessage(error), variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const logo = theme === "dark" ? logoDark : theme === "light" ? logoLight : logoImg;

  return (
    <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
      <div className="text-center mb-8">
        <img src={logo} alt="Vaultire Infinite" className="h-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.signIn")}</h1>
        <p className="text-muted-foreground text-sm">{t("auth.enterCredentials")}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="crypto-label">{t("auth.emailPhoneOrMemberId")}</label>
          <input id="email" type="text" {...register("email")} className="crypto-input" placeholder={t("auth.enterEmailPhoneOrMemberId")} />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="crypto-label">{t("auth.password")}</label>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="crypto-input pr-10" placeholder={t("auth.enterPassword")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="crypto-label flex items-center gap-2"><Shield size={14} className="text-primary" />{t("auth.twoFACode")}</label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpValue} onChange={handleOtpChange}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} className="crypto-input w-10 h-12 text-center text-lg" />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-muted-foreground text-xs mt-2 text-center">{t("auth.twoFAHint")}</p>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("rememberMe")} className="w-4 h-4 rounded border-border bg-input accent-primary" />
            <span className="text-muted-foreground text-sm">{t("auth.rememberMe")}</span>
          </label>
          <div className="flex flex-col items-end gap-1">
            <Link to="/forgot-password" className="crypto-link text-sm">{t("auth.forgotPassword")}</Link>
            <Link to="/request-2fa-reset" className="crypto-link text-sm">{t("auth.forgot2FA")}</Link>
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="crypto-button w-full">
          {isLoading ? <div className="flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={18} /><span>{t("auth.signingIn")}</span></div> : t("auth.signIn")}
        </button>
        <p className="text-center text-muted-foreground text-sm">
          {t("auth.dontHaveAccount")} <Link to="/signup" className="crypto-link">{t("auth.clickToSignUp")}</Link>
        </p>
      </form>
    </div>
  );
};

export default SigninForm;
