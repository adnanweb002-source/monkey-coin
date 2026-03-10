import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRanks, createRank, updateRank, deleteRank, type Rank } from "@/lib/rankApi";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Trophy } from "lucide-react";

const AdminRanks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", order: "", requiredLeft: "", requiredRight: "",
    rewardAmount: "", rewardTitle: "",
  });

  const { data: ranks, isLoading } = useQuery({
    queryKey: ["admin-ranks"],
    queryFn: getRanks,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Rank, "id">) => createRank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Rank created successfully" });
      closeModal();
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Rank, "id"> }) => updateRank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Rank updated successfully" });
      closeModal();
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ranks"] });
      toast({ title: "Rank deleted successfully" });
      setDeleteId(null);
    },
    onError: (err) => toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" }),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingRank(null);
    setForm({ name: "", order: "", requiredLeft: "", requiredRight: "", rewardAmount: "", rewardTitle: "" });
  };

  const openCreate = () => {
    setEditingRank(null);
    setForm({ name: "", order: "", requiredLeft: "", requiredRight: "", rewardAmount: "", rewardTitle: "" });
    setModalOpen(true);
  };

  const openEdit = (rank: Rank) => {
    setEditingRank(rank);
    setForm({
      name: rank.name,
      order: String(rank.order),
      requiredLeft: String(rank.requiredLeft),
      requiredRight: String(rank.requiredRight),
      rewardAmount: String(rank.rewardAmount),
      rewardTitle: rank.rewardTitle || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      order: Number(form.order),
      requiredLeft: Number(form.requiredLeft),
      requiredRight: Number(form.requiredRight),
      rewardAmount: Number(form.rewardAmount),
      rewardTitle: form.rewardTitle || undefined,
    };
    if (editingRank) {
      updateMutation.mutate({ id: editingRank.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Rank Management</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Create Rank
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Rank Name</TableHead>
              <TableHead>Required Left</TableHead>
              <TableHead>Required Right</TableHead>
              <TableHead>Reward Amount</TableHead>
              <TableHead>Reward Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : ranks?.length ? (
              ranks.map((rank) => (
                <TableRow key={rank.id}>
                  <TableCell>{rank.order}</TableCell>
                  <TableCell className="font-medium">{rank.name}</TableCell>
                  <TableCell>{rank.requiredLeft.toLocaleString()}</TableCell>
                  <TableCell>{rank.requiredRight.toLocaleString()}</TableCell>
                  <TableCell>${rank.rewardAmount.toLocaleString()}</TableCell>
                  <TableCell>{rank.rewardTitle || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(rank)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(rank.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No ranks found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRank ? "Edit Rank" : "Create Rank"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Silver" />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required Left Volume</Label>
                <Input type="number" value={form.requiredLeft} onChange={(e) => setForm({ ...form, requiredLeft: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Required Right Volume</Label>
                <Input type="number" value={form.requiredRight} onChange={(e) => setForm({ ...form, requiredRight: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reward Amount</Label>
                <Input type="number" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Reward Title (optional)</Label>
                <Input value={form.rewardTitle} onChange={(e) => setForm({ ...form, rewardTitle: e.target.value })} placeholder="e.g. iPhone 15" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating || !form.name || !form.order}>
              {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRank ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this rank?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRanks;
