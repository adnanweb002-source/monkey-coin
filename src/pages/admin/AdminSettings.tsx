import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Settings, Pencil } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// All setting types that must always be displayed
const SETTING_TYPES = [
  "TRANSFER_TYPE",
  "BACK_OFFICE_CLOSING_TIME",
  "BACK_OFFICE_OPENING_TIME",
  "BINARY_INCOME_RATE",
  "REFERRAL_INCOME_RATE",
] as const;

type SettingType = typeof SETTING_TYPES[number];

interface Setting {
  id?: number;
  key: SettingType;
  value: string | null;
}

interface SettingDisplay {
  key: SettingType;
  value: string | null;
  isConfigured: boolean;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [editingSetting, setEditingSetting] = useState<SettingDisplay | null>(null);
  const [formValue, setFormValue] = useState("");

  const { data: settingsFromApi = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const response = await api.get("/admin/settings/get");
      return response.data;
    },
  });

  // Merge API settings with all required setting types
  const settings: SettingDisplay[] = SETTING_TYPES.map((key) => {
    const found = settingsFromApi.find((s) => s.key === key);
    return {
      key,
      value: found?.value ?? null,
      isConfigured: found?.value !== undefined && found?.value !== null,
    };
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: { key: SettingType; value: string }) => {
      const response = await api.post("/admin/settings/upsert", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Setting saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      setEditingSetting(null);
      setFormValue("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save setting",
        variant: "destructive",
      });
    },
  });

  const handleOpenEdit = (setting: SettingDisplay) => {
    setFormValue(setting.value ?? "");
    setEditingSetting(setting);
  };

  const handleSave = () => {
    if (!editingSetting) return;
    
    if (!formValue.trim()) {
      toast({
        title: "Validation Error",
        description: "Value cannot be empty",
        variant: "destructive",
      });
      return;
    }

    upsertMutation.mutate({
      key: editingSetting.key,
      value: formValue.trim(),
    });
  };

  const formatSettingKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Manage system-wide configuration settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Settings
          </CardTitle>
          <CardDescription>
            {settings.filter((s) => s.isConfigured).length} of {settings.length} settings configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile: Stacked cards
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {formatSettingKey(setting.key)}
                    </h4>
                    <Badge variant={setting.isConfigured ? "default" : "secondary"}>
                      {setting.isConfigured ? "Configured" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Value: </span>
                    <span className={`font-mono ${setting.isConfigured ? "text-foreground" : "text-muted-foreground italic"}`}>
                      {setting.isConfigured ? setting.value : "NA"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(setting)}
                      className="w-full"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {setting.isConfigured ? "Update Value" : "Set Value"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell className="font-medium">
                      {formatSettingKey(setting.key)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono ${setting.isConfigured ? "text-foreground" : "text-muted-foreground italic"}`}>
                        {setting.isConfigured ? setting.value : "NA"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={setting.isConfigured ? "default" : "secondary"}>
                        {setting.isConfigured ? "Configured" : "Not Set"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(setting)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        {setting.isConfigured ? "Update Value" : "Set Value"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingSetting} onOpenChange={(open) => !open && setEditingSetting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSetting?.isConfigured ? "Update Setting" : "Set Setting Value"}
            </DialogTitle>
            <DialogDescription>
              {editingSetting?.isConfigured
                ? "Update the value for this setting."
                : "Set the initial value for this setting."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Setting Key</Label>
              <Input
                value={editingSetting ? formatSettingKey(editingSetting.key) : ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingSetting(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={upsertMutation.isPending}
              className="w-full sm:w-auto"
            >
              {upsertMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
