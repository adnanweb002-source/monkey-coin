import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function EditUserModal({
  open,
  onOpenChange,
  user,
}: EditUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
      setEmail(user.email ?? "");
      setPhone(user.phoneNumber ?? "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};

      if (name) payload.name = name;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const res = await api.patch(
        `/admin/users/${user.id}/profile`,
        payload
      );

      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}