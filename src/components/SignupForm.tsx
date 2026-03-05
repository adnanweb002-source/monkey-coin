import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCw, ChevronDown, Eye, EyeOff, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import logoImg from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useTheme } from "next-themes";
import { countries } from "@/lib/countries";
// utils/captcha.ts
export function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

const signupSchema = z
  .object({
    sponsorId: z.string(),
    position: z.enum(["LEFT", "RIGHT", "AUTO"], {
      required_error: "Position is required",
    }),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name is too long"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    confirmEmail: z.string().email("Invalid email address"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    captcha: z.string().min(1, "Please enter the captcha"),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the terms of use"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha());
  const [phoneCode, setPhoneCode] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const { toast } = useToast();
  const { theme } = useTheme();

  const [searchParams] = useSearchParams();
  const sponsorIdParam = searchParams.get("ref");
  const parentIdParam = searchParams.get("parent");
  const positionParam = searchParams.get("position");

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const selectedCountry = watch("country");

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const navigate = useNavigate();
  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    // const { firstName, lastName, phone, country, email, password, sponsorMemberId, parentMemberId, position } = dto;
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phoneNumber,
        country: data.country,
        email: data.email,
        password: data.password,
        sponsorMemberId: sponsorIdParam || data.sponsorId || null,
        position:
          positionParam ??
          (data.position === "AUTO" ? null : (data.position ?? null)),
        parentMemberId: parentIdParam || null,
      };
      console.log(payload);
      const response = await api.post("/auth/register", payload);

      if (!response?.data?.id) {
        toast({
          title: "Error",
          description:
            response?.data?.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const profileResponse = await api.get("/auth/get-profile");
      const userProfile = profileResponse?.data;

      if(!userProfile) {
        toast({
          title: "Error",
          description: "Failed to retrieve user profile after registration.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crypto-card w-full max-w-2xl mx-auto z-10">
      <div className="text-center mb-8">
       {theme === "dark" ? (
          <img
            src={logoDark}
            alt="Vaultire Infinite"
            className="h-20 mx-auto mb-4"
          />
        ) : theme === "light" ? (
          <img
            src={logoLight}
            alt="Vaultire Infinite"
            className="h-20 mx-auto mb-4"
          />
        ) : (
          <img
            src={logoImg}
            alt="Vaultire Infinite"
            className="h-20 mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-foreground mb-2">Sign Up</h1>
        <p className="text-muted-foreground">
          Create your account to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="crypto-label">Sponsor ID</label>
            <input
              type="text"
              placeholder="1234567890"
              className="crypto-input"
              defaultValue={sponsorIdParam || ""}
              disabled
              {...register("sponsorId")}
            />
            {errors.sponsorId && (
              <p className="text-destructive text-sm mt-1">
                {errors.sponsorId.message}
              </p>
            )}
          </div>
          <div>
            <label className="crypto-label">Position</label>
            <div className="relative">
              <select
                className="crypto-input appearance-none pr-10"
                {...register("position")}
                defaultValue={positionParam}
                disabled
              >
                <option value="AUTO">Auto</option>
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
            {errors.position && (
              <p className="text-destructive text-sm mt-1">
                {errors.position.message}
              </p>
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
              <p className="text-destructive text-sm mt-1">
                {errors.firstName.message}
              </p>
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
              <p className="text-destructive text-sm mt-1">
                {errors.email.message}
              </p>
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
              <p className="text-destructive text-sm mt-1">
                {errors.confirmEmail.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Country & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="crypto-label">Country</label>
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="crypto-input w-full text-left flex items-center justify-between"
            >
              <span className={selectedCountry ? "text-foreground" : "text-muted-foreground"}>
                {selectedCountry || "Select country"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {countryOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex justify-between items-center"
                      onClick={() => {
                        setValue("country", c.name, { shouldValidate: true });
                        setPhoneCode(c.dialCode);
                        const currentPhone = watch("phoneNumber") || "";
                        // Replace old code or set new one
                        const phoneWithoutCode = currentPhone.replace(/^\+[\d-]+\s?/, "");
                        setValue("phoneNumber", `${c.dialCode} ${phoneWithoutCode}`, { shouldValidate: true });
                        setCountryOpen(false);
                        setCountrySearch("");
                      }}
                    >
                      <span>{c.name}</span>
                      <span className="text-muted-foreground text-xs">{c.dialCode}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No countries found</p>
                  )}
                </div>
              </div>
            )}
            <input type="hidden" {...register("country")} />
            {errors.country && (
              <p className="text-destructive text-sm mt-1">
                {errors.country.message}
              </p>
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
              <p className="text-destructive text-sm mt-1">
                {errors.phoneNumber.message}
              </p>
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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm mt-1">
                {errors.password.message}
              </p>
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
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 6: Captcha */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
        </div> */}
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div className="flex gap-3">
            <div className="bg-secondary/50 px-4 py-3 rounded-lg flex-1 text-2xl italic tracking-widest select-none">
              {captchaValue}
            </div>
            <button
              type="button"
              onClick={() => {
                setCaptchaValue(generateCaptcha());
                resetField("captcha");
              }}
              className="p-3 bg-secondary/50 rounded-lg"
            >
              <RefreshCw />
            </button>
          </div>

          <div>
            <input
              className="crypto-input"
              placeholder="Enter captcha"
              {...register("captcha", {
                onChange: (e) =>
                  (e.target.value = e.target.value.toUpperCase()),
              })}
            />
            {errors.captcha && (
              <p className="text-destructive text-sm">
                {errors.captcha.message}
              </p>
            )}
          </div>
        </div>
        {/* Password Note */}
        <p className="text-sm text-muted-foreground">
          Note: Password should be between 8 to 16 characters in length and
          should include at least one upper case letter, one number, and one
          special character.
        </p>

        {/* Terms Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="agreeTerms"
            className="w-4 h-4 rounded border-border bg-input accent-primary cursor-pointer"
            {...register("agreeTerms")}
          />
          <label
            htmlFor="agreeTerms"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            I agree with the terms of use
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-destructive text-sm">
            {errors.agreeTerms.message}
          </p>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting} className="crypto-button">
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an Account{" "}
          <Link to="/signin" className="crypto-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
