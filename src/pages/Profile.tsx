import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Package,
  Calendar,
  Phone,
  Globe,
  Shield,
  Hash,
  AlertTriangle,
  Wallet,
  Image,
  ChevronDown,
  Search,
} from "lucide-react";
import type { UserProfile } from "@/types/user";
import ExternalWalletsTab from "@/components/profile/ExternalWalletsTab";
import AvatarSelector from "@/components/profile/AvatarSelector";
import UserAvatar from "@/components/common/UserAvatar";
import { countries } from "@/lib/countries";
import Change2FAModal from "@/components/profile/Change2FAModal";
import { useTranslation } from "react-i18next";

interface PackagePurchase {
  id: number;
  amount: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED";
  package: {
    name: string;
    investmentMin: string;
    investmentMax: string;
    dailyReturnPct: string;
    durationDays: number;
    capitalReturn: boolean;
  };
}

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  twoFactorCode: z.string().optional(),
});

const changeEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  twoFactorCode: z.string().optional(),
});

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type ChangeEmailData = z.infer<typeof changeEmailSchema>;

const Profile = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [change2FAOpen, setChange2FAOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openTab === "security") {
      setActiveTab("security");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/auth/get-profile");
      localStorage.setItem("userProfile", JSON.stringify(response.data));
      return response.data;
    },
  });

  const { data: packages = [], isLoading: packagesLoading } = useQuery<
    PackagePurchase[]
  >({
    queryKey: ["myPackages"],
    queryFn: async () => {
      const response = await api.get("/packages/my");
      return response.data;
    },
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", twoFactorCode: "" },
  });

  const emailForm = useForm<ChangeEmailData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "", twoFactorCode: "" },
  });

  const { register, handleSubmit, setValue, watch, formState } =
    useForm<UpdateProfileData>({
      resolver: zodResolver(updateProfileSchema),
      values: {
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        country: profile?.country || "",
        phoneNumber: profile?.phoneNumber || "",
        email: profile?.email || "",
      },
    });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const payload: Record<string, string> = {};
      if (data.firstName && data.firstName !== profile?.firstName) payload.firstName = data.firstName;
      if (data.lastName && data.lastName !== profile?.lastName) payload.lastName = data.lastName;
      if (data.country && data.country !== profile?.country) payload.country = data.country;
      if (data.phoneNumber && data.phoneNumber !== profile?.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.email && data.email !== profile?.email) payload.email = data.email;
      if (Object.keys(payload).length === 0) throw new Error("No changes made");
      const res = await api.post("/auth/update-user-profile", payload);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("profile.profileUpdated") });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err: any) => {
      toast({
        title: t("common.error"),
        description: err.message || err.response?.data?.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const payload: Record<string, string> = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      if (data.twoFactorCode) payload.twoFactorCode = data.twoFactorCode;
      const response = await api.post("/auth/change-password", payload);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("profile.passwordChanged") });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("profile.failedToChangePassword"),
        variant: "destructive",
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (data: ChangeEmailData) => {
      const payload: Record<string, string> = { newEmail: data.email };
      if (data.twoFactorCode) payload.twoFactorCode = data.twoFactorCode;
      const response = await api.post("/auth/change-email", payload);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("profile.emailChanged") });
      emailForm.reset();
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("profile.failedToChangeEmail"),
        variant: "destructive",
      });
    },
  });

  const selectedCountry = watch("country");

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  useEffect(() => {
    const close = () => setCountryOpen(false);
    if (countryOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [countryOpen]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t("profile.failedToLoadProfile")}</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.manageSettings")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 max-w-3xl">
          <TabsTrigger value="profile">{t("profile.profileTab")}</TabsTrigger>
          <TabsTrigger value="avatar">{t("profile.avatarTab")}</TabsTrigger>
          <TabsTrigger value="security">{t("profile.securityTab")}</TabsTrigger>
          <TabsTrigger value="settings">{t("profile.settingsTab")}</TabsTrigger>
          <TabsTrigger value="wallets">{t("profile.walletsTab")}</TabsTrigger>
          <TabsTrigger value="packages">{t("profile.packagesTab")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                {t("profile.personalInfo")}
              </CardTitle>
              <CardDescription>{t("profile.accountDetails")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <UserAvatar avatarId={profile?.avatarId} size="xl" />
                <div>
                  <p className="font-semibold text-lg text-foreground">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Badge
                    variant={profile?.status === "ACTIVE" ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {profile?.status || "N/A"}
                  </Badge>
                </div>
              </div>
              <form onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">{t("profile.firstName")}</Label>
                  <Input placeholder={profile?.firstName || "N/A"} {...register("firstName")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">{t("profile.lastName")}</Label>
                  <Input placeholder={profile?.lastName || "N/A"} {...register("lastName")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Phone size={14} /> {t("profile.email")}
                  </Label>
                  <Input type="email" placeholder={profile?.email || "N/A"} {...register("email")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Phone size={14} /> {t("profile.phone")}
                  </Label>
                  <Input placeholder={profile?.phoneNumber || "N/A"} {...register("phoneNumber")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Hash size={14} /> {t("profile.memberId")}
                  </Label>
                  <p className="font-medium font-mono">{profile?.memberId || "N/A"}</p>
                </div>

                <div className="space-y-1 relative">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Globe size={14} /> {t("profile.country")}
                  </Label>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCountryOpen((prev) => !prev); }}
                    className="crypto-input w-full text-left flex items-center justify-between"
                  >
                    <span className={selectedCountry ? "text-foreground" : "text-muted-foreground"}>
                      {selectedCountry || profile?.country || t("profile.selectCountry")}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {countryOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={t("profile.searchCountry")}
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
                            className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center ${
                              selectedCountry === c.name ? "bg-accent" : "hover:bg-accent/50"
                            }`}
                            onClick={() => {
                              setValue("country", c.name, { shouldValidate: true });
                              const currentPhone = watch("phoneNumber") || "";
                              const phoneWithoutCode = currentPhone.replace(/^\+[\d-]+\s?/, "");
                              setValue("phoneNumber", `${c.dialCode} ${phoneWithoutCode}`.trim(), { shouldValidate: true });
                              setCountryOpen(false);
                              setCountrySearch("");
                            }}
                          >
                            <span>{c.name}</span>
                            <span className="text-muted-foreground text-xs">{c.dialCode}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="px-3 py-2 text-sm text-muted-foreground">{t("profile.noCountriesFound")}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">{t("profile.status")}</Label>
                  <div>
                    <Badge variant={profile?.status === "ACTIVE" ? "default" : "destructive"}>
                      {profile?.status || "N/A"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Shield size={14} /> {t("profile.role")}
                  </Label>
                  <div>
                    <Badge variant={profile?.role === "ADMIN" ? "secondary" : "outline"}>
                      {profile?.role || "USER"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">{t("profile.twoFAEnabled")}</Label>
                  <div>
                    <Badge variant={profile?.isG2faEnabled ? "default" : "outline"}>
                      {profile?.isG2faEnabled ? t("common.enabled") : t("common.disabled")}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end md:col-span-2">
                  <Button type="submit" disabled={updateProfileMutation.isPending || !formState.isDirty}>
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("profile.updating")}
                      </>
                    ) : (
                      t("profile.updateProfile")
                    )}
                  </Button>
                </div>
              </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avatar Tab */}
        <TabsContent value="avatar" className="space-y-4 mt-6">
          <AvatarSelector currentAvatarId={profile?.avatarId} />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                {t("profile.twoFactorAuth")}
              </CardTitle>
              <CardDescription>{t("profile.addExtraLayer")}</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.isG2faEnabled ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-500" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">{t("profile.twoFAIsEnabled")}</p>
                      <p className="text-sm text-green-600 dark:text-green-500">{t("profile.accountProtected")}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => setChange2FAOpen(true)} className="w-full sm:w-auto">
                      <Shield className="h-4 w-4 mr-2" />
                      {t("profile.change2FA")}
                    </Button>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <h4 className="text-sm font-medium text-foreground">{t("profile.reset2FA")}</h4>
                    <p className="text-sm text-muted-foreground">{t("profile.reset2FAHelper")}</p>
                    <Button variant="outline" onClick={() => navigate("/panel/request-2fa-reset")} className="w-full sm:w-auto">
                      {t("profile.reset2FA")}
                    </Button>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate("/panel/2fa-reset-request-for-admin")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      {t("profile.lostBothAccess")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">{t("profile.twoFANotEnabled")}</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">{t("profile.twoFANotEnabledDesc")}</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/panel/security/2fa/setup")} className="w-full sm:w-auto">
                    <Shield className="h-4 w-4 mr-2" />
                    {t("profile.setup2FA")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Change2FAModal open={change2FAOpen} onOpenChange={setChange2FAOpen} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} />
                {t("profile.changePassword")}
              </CardTitle>
              <CardDescription>{t("profile.updatePassword")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
                className="space-y-4 max-w-md"
              >
                <div className="space-y-2">
                  <Label>{t("profile.currentPassword")}</Label>
                  <Input type="password" placeholder={t("profile.enterCurrentPassword")} {...passwordForm.register("oldPassword")} />
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-destructive text-sm">{passwordForm.formState.errors.oldPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.newPassword")}</Label>
                  <Input type="password" placeholder={t("profile.enterNewPassword")} {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-destructive text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                {profile?.isG2faEnabled && (
                  <div className="space-y-2">
                    <Label>{t("profile.twoFACodeIfEnabled")}</Label>
                    <Input placeholder={t("profile.enter2FACode")} {...passwordForm.register("twoFactorCode")} />
                  </div>
                )}
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("profile.updating")}
                    </>
                  ) : (
                    t("profile.changePassword")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                {t("profile.changeEmail")}
              </CardTitle>
              <CardDescription>{t("profile.updateEmail")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={emailForm.handleSubmit((data) => changeEmailMutation.mutate(data))}
                className="space-y-4 max-w-md"
              >
                <div className="space-y-2">
                  <Label>{t("profile.newEmail")}</Label>
                  <Input type="email" placeholder={t("profile.enterNewEmail")} {...emailForm.register("email")} />
                  {emailForm.formState.errors.email && (
                    <p className="text-destructive text-sm">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                {profile?.isG2faEnabled && (
                  <div className="space-y-2">
                    <Label>{t("profile.twoFACodeIfEnabled")}</Label>
                    <Input placeholder={t("profile.enter2FACode")} {...emailForm.register("twoFactorCode")} />
                  </div>
                )}
                <Button type="submit" disabled={changeEmailMutation.isPending}>
                  {changeEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("profile.updating")}
                    </>
                  ) : (
                    t("profile.changeEmail")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4 mt-6">
          <ExternalWalletsTab />
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                {t("profile.myPackages")}
              </CardTitle>
              <CardDescription>{t("profile.purchasedPackages")}</CardDescription>
            </CardHeader>
            <CardContent>
              {packagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t("profile.noPackagesPurchased")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((purchase) => (
                    <div key={purchase.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-foreground">{purchase.package.name}</h4>
                        <Badge variant={purchase.status === "ACTIVE" ? "default" : "secondary"}>
                          {purchase.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">{t("profile.purchaseAmount")}</p>
                          <p className="font-medium">${parseFloat(purchase.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("profile.dailyReturn")}</p>
                          <p className="font-medium text-primary">{purchase.package.dailyReturnPct}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("profile.duration")}</p>
                          <p className="font-medium">{purchase.package.durationDays} {t("profile.days")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("profile.capitalReturn")}</p>
                          <p className="font-medium">{purchase.package.capitalReturn ? t("common.yes") : t("common.no")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{t("profile.start")}: {formatDate(purchase.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{t("profile.end")}: {formatDate(purchase.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
