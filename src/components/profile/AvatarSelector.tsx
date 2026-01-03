import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VALID_AVATAR_IDS, type AvatarId } from "@/types/user";
import { getAvatarImage } from "@/components/common/UserAvatar";

interface AvatarSelectorProps {
  currentAvatarId?: string;
}

const AvatarSelector = ({ currentAvatarId }: AvatarSelectorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(
    (currentAvatarId as AvatarId) || "default"
  );

  const changeAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const response = await api.post("/auth/change-avatar", { avatarId });
      return response.data;
    },
    onSuccess: () => {
      // Update localStorage
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const profile = JSON.parse(stored);
        profile.avatarId = selectedAvatar;
        localStorage.setItem("userProfile", JSON.stringify(profile));
      }

      // Dispatch custom event for header update
      window.dispatchEvent(new Event("profileUpdated"));

      // Invalidate query to refresh
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedAvatar) {
      toast({
        title: "Error",
        description: "Please select an avatar",
        variant: "destructive",
      });
      return;
    }
    changeAvatarMutation.mutate(selectedAvatar);
  };

  const hasChanges = selectedAvatar !== (currentAvatarId || "default");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Change Avatar
        </CardTitle>
        <CardDescription>
          Select an avatar to personalize your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Display */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
            <img
              src={getAvatarImage(selectedAvatar)}
              alt="Selected avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-foreground">Current Selection</p>
            <p className="text-sm text-muted-foreground">
              {selectedAvatar === "default" ? "Default Avatar" : `Avatar ${selectedAvatar}`}
            </p>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {VALID_AVATAR_IDS.map((avatarId) => (
            <button
              key={avatarId}
              onClick={() => setSelectedAvatar(avatarId)}
              className={cn(
                "relative aspect-square rounded-full overflow-hidden border-4 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedAvatar === avatarId
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={getAvatarImage(avatarId)}
                alt={avatarId === "default" ? "Default avatar" : `Avatar ${avatarId}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {selectedAvatar === avatarId && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={changeAvatarMutation.isPending || !hasChanges}
          >
            {changeAvatarMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Avatar"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSelector;
