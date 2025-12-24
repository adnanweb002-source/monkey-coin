import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api, { tokenStorage, getErrorMessage } from "@/lib/api";

const signinSchema = z.object({
  email: z.string().min(4, "Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SigninFormData = z.infer<typeof signinSchema>;

const SigninForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        phoneOrEmail: data.email,
        password: data.password,
      };

      const response = await api.post("/auth/login", payload);
      const { accessToken, refreshToken } = response?.data;

      // Store tokens using tokenStorage utility
      tokenStorage.setTokens(accessToken, refreshToken);

      // Fetch user profile after successful login
      const profileResponse = await api.get("/auth/get-profile");
      const userProfile = profileResponse?.data;
      
      // Store user profile in localStorage
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });

      // Navigate to Dashboard
      navigate("/dashboard");
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
    <div className="crypto-card w-full max-w-md mx-4 p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
        <p className="text-muted-foreground text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
            placeholder=""
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
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
              placeholder=""
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
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
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
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Signing in...
            </>
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
