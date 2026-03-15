import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Type for deposit bonus
interface DepositBonus {
  id: number;
  bonusPercentage: number;
  startDate: string;
  endDate: string;
}

interface FormData {
  bonusPercentage: string;
  startDate: string;
  endDate: string;
}

const DepositBonusSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [editingBonus, setEditingBonus] = useState<DepositBonus | null>(null);
  const [form, setForm] = useState<FormData>({
    bonusPercentage: "",
    startDate: "",
    endDate: "",
  });

  const { data: bonuses = [], isLoading } = useQuery<DepositBonus[]>({
    queryKey: ["depositBonuses"],
    queryFn: async () => {
      const response = await api.get("/admin/deposit-bonus");
      return response.data;
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: FormData & { id?: number }) => {
      const payload = {
        ...data,
        bonusPercentage: Number(data.bonusPercentage),
      };
      if (data.id) {
        const response = await api.patch(
          `/admin/deposit-bonus/${data.id}`,
          payload,
        );
        return response.data.bonus;
      } else {
        const response = await api.post("/admin/deposit-bonus", payload);
        return response.data.bonus;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deposit bonus saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["depositBonuses"] });
      setEditingBonus(null);
      setForm({ bonusPercentage: "", startDate: "", endDate: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save deposit bonus",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/deposit-bonus/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Deposit bonus deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["depositBonuses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete deposit bonus",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (bonus: DepositBonus) => {
    setEditingBonus(bonus);
    setForm({
      bonusPercentage: bonus.bonusPercentage.toString(),
      startDate: bonus.startDate.split("T")[0],
      endDate: bonus.endDate.split("T")[0],
    });
  };

  const handleSave = () => {
    if (!form.bonusPercentage || !form.startDate || !form.endDate) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    const data: FormData & { id?: number } = {
      id: editingBonus?.id,
      bonusPercentage: form.bonusPercentage, // keep as string
      startDate: form.startDate,
      endDate: form.endDate,
    };

    createOrUpdateMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this deposit bonus?")) {
      deleteMutation.mutate(id);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Deposit Bonuses
          </h1>
          <p className="text-muted-foreground">
            Manage deposit bonus percentages and date ranges
          </p>
        </div>
        <Button
          onClick={() =>
            setEditingBonus({
              id: 0,
              bonusPercentage: 0,
              startDate: "",
              endDate: "",
            })
          }
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Bonus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Bonuses List</CardTitle>
          <CardDescription>{bonuses.length} bonuses found</CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {bonuses.map((b) => (
                <div
                  key={b.id}
                  className="border border-border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      Bonus: {b.bonusPercentage}%
                    </span>
                    <span>
                      {b.startDate.split("T")[0]} → {b.endDate.split("T")[0]}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(b)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bonus %</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.bonusPercentage}%</TableCell>
                    <TableCell>{b.startDate.split("T")[0]}</TableCell>
                    <TableCell>{b.endDate.split("T")[0]}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(b)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={!!editingBonus}
        onOpenChange={(open) => !open && setEditingBonus(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBonus?.id ? "Edit Deposit Bonus" : "Add Deposit Bonus"}
            </DialogTitle>
            <DialogDescription>
              {editingBonus?.id
                ? "Update existing bonus."
                : "Create a new deposit bonus."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bonus Percentage *</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.bonusPercentage}
                onChange={(e) =>
                  setForm({ ...form, bonusPercentage: e.target.value })
                }
                placeholder="Enter bonus %"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingBonus(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createOrUpdateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createOrUpdateMutation.isPending ? (
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

export default DepositBonusSettings;
