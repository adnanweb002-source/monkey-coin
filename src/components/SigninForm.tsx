import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { tokenStorage, getErrorMessage } from "@/lib/api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const signinSchema = z.object({
  email: z.string().min(4, "Email is required"),
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type SigninFormData = z.infer<typeof signinSchema>;

const SigninForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      rememberMe: false,
      code: "",
    },
  });

  // Sync OTP value with form
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    setValue("code", value);
  };

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    try {
      const payload: Record<string, string> = {
        phoneOrEmail: data.email,
        password: data.password,
      };

      // Include OTP code if provided
      if (otpValue && otpValue.length > 0) {
        payload.code = otpValue;
      }

      const response = await api.post("/auth/login", payload);
      const { accessToken, refreshToken } = response?.data;

      // Store tokens using tokenStorage utility
      tokenStorage.setTokens(accessToken, refreshToken);

      // Fetch user profile after successful login
      const profileResponse = await api.get("/auth/get-profile");
      const userProfile = profileResponse?.data;

      // Store user profile in localStorage
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      if (userProfile?.role == "ADMIN") {
        toast({
          title: "Admin Login Detected",
          description: "You have been signed in successfully.",
        });
        if (import.meta.env.VITE_ENVIRONMENT === "production") {
          window.location.href = "https://admin.gogex.xyz";
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Success!",
          description: "You have been signed in successfully.",
        });
        navigate("/dashboard");
      }
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

  return (
    <div className="crypto-card w-full max-w-md mx-4 p-8 z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="crypto-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="crypto-input"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="crypto-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="crypto-input pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 2FA Code - Always Visible */}
        <div>
          <label className="crypto-label flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            2FA Code (OTP)
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpValue} onChange={handleOtpChange}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="crypto-input w-10 h-12 text-center text-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-muted-foreground text-xs mt-2 text-center">
            If you have enabled Two-Factor Authentication, enter the code from
            your authenticator app. If 2FA is not enabled on your account, leave
            this blank.
          </p>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded border-border bg-input accent-primary"
            />
            <span className="text-muted-foreground text-sm">Remember me?</span>
          </label>
          <Link to="/forgot-password" className="crypto-link text-sm">
            Forgot Password
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="crypto-button w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={18} />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link to="/" className="crypto-link">
            Click here to sign up.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SigninForm;
