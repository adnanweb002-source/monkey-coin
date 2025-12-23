import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCw, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  sponsorId: z.string().min(1, "Sponsor ID is required"),
  position: z.enum(["LEFT", "RIGHT"], { required_error: "Position is required" }),
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  confirmEmail: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  captcha: z.string().min(1, "Please enter the captcha"),
  agreeTerms: z.boolean().refine(val => val === true, "You must agree to the terms of use"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Emails do not match",
  path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      position: "LEFT",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare payload (exclude lastName and confirmEmail/confirmPassword as per requirements)
      const payload = {
        sponsorId: data.sponsorId,
        position: data.position,
        username: data.firstName,
        email: data.email,
        country: data.country,
        phoneNumber: data.phoneNumber,
        password: data.password,
      };

      // Replace with your actual API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crypto-card w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sign Up</h1>
        <p className="text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Row 1: Sponsor ID & Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">Sponsor ID</label>
            <input
              type="text"
              placeholder="1234567890"
              className="crypto-input"
              {...register("sponsorId")}
            />
            {errors.sponsorId && (
              <p className="text-destructive text-sm mt-1">{errors.sponsorId.message}</p>
            )}
          </div>
          <div>
            <label className="crypto-label">Position</label>
            <div className="relative">
              <select
                className="crypto-input appearance-none pr-10"
                {...register("position")}
              >
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
            {errors.position && (
              <p className="text-destructive text-sm mt-1">{errors.position.message}</p>
            )}
          </div>
        </div>

        {/* Row 2: First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">First Name</label>
            <input
              type="text"
              className="crypto-input"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="crypto-label">Last Name</label>
            <input
              type="text"
              className="crypto-input"
              {...register("lastName")}
            />
          </div>
        </div>

        {/* Row 3: Email & Confirm Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">Email</label>
            <input
              type="email"
              className="crypto-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="crypto-label">Confirm Email</label>
            <input
              type="email"
              className="crypto-input"
              {...register("confirmEmail")}
            />
            {errors.confirmEmail && (
              <p className="text-destructive text-sm mt-1">{errors.confirmEmail.message}</p>
            )}
          </div>
        </div>

        {/* Row 4: Country & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">Country</label>
            <input
              type="text"
              className="crypto-input"
              {...register("country")}
            />
            {errors.country && (
              <p className="text-destructive text-sm mt-1">{errors.country.message}</p>
            )}
          </div>
          <div>
            <label className="crypto-label">Phone Number</label>
            <input
              type="tel"
              className="crypto-input"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-destructive text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        {/* Row 5: Password & Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="crypto-input pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="crypto-label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="crypto-input pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Row 6: Captcha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/50 px-4 py-3 rounded-lg flex-1">
              <span className="text-2xl italic text-primary font-serif tracking-wider select-none">
                Verification
              </span>
            </div>
            <button
              type="button"
              className="p-3 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="crypto-label">Captcha</label>
            <input
              type="text"
              className="crypto-input"
              {...register("captcha")}
            />
            {errors.captcha && (
              <p className="text-destructive text-sm mt-1">{errors.captcha.message}</p>
            )}
          </div>
        </div>

        {/* Password Note */}
        <p className="text-sm text-muted-foreground">
          Note: Password should be between 8 to 16 characters in length and should include at least one upper case letter, one number, and one special character.
        </p>

        {/* Terms Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="agreeTerms"
            className="w-4 h-4 rounded border-border bg-input accent-primary cursor-pointer"
            {...register("agreeTerms")}
          />
          <label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer">
            I agree with the terms of use
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-destructive text-sm">{errors.agreeTerms.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="crypto-button"
        >
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an Account?{" "}
          <Link to="/signin" className="crypto-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
