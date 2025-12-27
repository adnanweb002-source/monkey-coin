import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Mail, Lock, Package, Calendar, Phone, Globe, Shield, Hash } from "lucide-react";
import type { UserProfile } from "@/types/user";

interface PackagePurchase {
  id: number;
  purchaseAmount: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED";
  package: {
    name: string;
    investmentMin: string;
    investmentMax: string;
    dailyReturnPercent: string;
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

type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type ChangeEmailData = z.infer<typeof changeEmailSchema>;

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/get-user-profile");
      localStorage.setItem("userProfile", JSON.stringify(response.data));
      return response.data;
    },
  });

  const { data: packages = [], isLoading: packagesLoading } = useQuery<PackagePurchase[]>({
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

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const payload: Record<string, string> = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      if (data.twoFactorCode) {
        payload.twoFactorCode = data.twoFactorCode;
      }
      const response = await api.post("/change-password", payload);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password changed successfully" });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (data: ChangeEmailData) => {
      const payload: Record<string, string> = { email: data.email };
      if (data.twoFactorCode) {
        payload.twoFactorCode = data.twoFactorCode;
      }
      const response = await api.post("/change-email", payload);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Email changed successfully" });
      emailForm.reset();
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change email",
        variant: "destructive",
      });
    },
  });

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
        <p className="text-destructive">Failed to load profile</p>
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
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and packages</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="packages">My Packages</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">First Name</Label>
                  <p className="font-medium">{profile?.firstName || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Last Name</Label>
                  <p className="font-medium">{profile?.lastName || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Mail size={14} /> Email
                  </Label>
                  <p className="font-medium">{profile?.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Phone size={14} /> Phone
                  </Label>
                  <p className="font-medium">{profile?.phoneNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Hash size={14} /> Member ID
                  </Label>
                  <p className="font-medium font-mono">{profile?.memberId || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Globe size={14} /> Country
                  </Label>
                  <p className="font-medium">{profile?.country || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <div>
                    <Badge variant={profile?.status === "ACTIVE" ? "default" : "destructive"}>
                      {profile?.status || "N/A"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Shield size={14} /> Role
                  </Label>
                  <div>
                    <Badge variant={profile?.role === "ADMIN" ? "secondary" : "outline"}>
                      {profile?.role || "USER"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">2FA Enabled</Label>
                  <div>
                    <Badge variant={profile?.isG2faEnabled ? "default" : "outline"}>
                      {profile?.isG2faEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" {...passwordForm.register("oldPassword")} />
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-destructive text-sm">{passwordForm.formState.errors.oldPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-destructive text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                {profile?.isG2faEnabled && (
                  <div className="space-y-2">
                    <Label>2FA Code (if enabled)</Label>
                    <Input placeholder="Enter 2FA code" {...passwordForm.register("twoFactorCode")} />
                  </div>
                )}
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Change Email
              </CardTitle>
              <CardDescription>Update your email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit((data) => changeEmailMutation.mutate(data))} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>New Email</Label>
                  <Input type="email" placeholder="Enter new email" {...emailForm.register("email")} />
                  {emailForm.formState.errors.email && (
                    <p className="text-destructive text-sm">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                {profile?.isG2faEnabled && (
                  <div className="space-y-2">
                    <Label>2FA Code (if enabled)</Label>
                    <Input placeholder="Enter 2FA code" {...emailForm.register("twoFactorCode")} />
                  </div>
                )}
                <Button type="submit" disabled={changeEmailMutation.isPending}>
                  {changeEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Change Email"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                My Packages
              </CardTitle>
              <CardDescription>Your purchased investment packages</CardDescription>
            </CardHeader>
            <CardContent>
              {packagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No packages purchased yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-foreground">{purchase.package.name}</h4>
                        <Badge variant={purchase.status === "ACTIVE" ? "default" : "secondary"}>
                          {purchase.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Purchase Amount</p>
                          <p className="font-medium">${parseFloat(purchase.purchaseAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily Return</p>
                          <p className="font-medium text-primary">{purchase.package.dailyReturnPercent}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{purchase.package.durationDays} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capital Return</p>
                          <p className="font-medium">{purchase.package.capitalReturn ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Start: {formatDate(purchase.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>End: {formatDate(purchase.endDate)}</span>
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
