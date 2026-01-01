import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Loader2, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Package } from "@/types/package";

interface PackageFormData {
  name: string;
  investmentMin: string;
  investmentMax: string;
  dailyReturnPct: string;
  durationDays: number;
  capitalReturn: string;
  isActive: boolean;
}

const initialFormData: PackageFormData = {
  name: "",
  investmentMin: "",
  investmentMax: "",
  dailyReturnPct: "",
  durationDays: 0,
  capitalReturn: "",
  isActive: true,
};

const AdminPackages = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  // Fetch packages
  const { data: packages = [], isLoading, isError } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const response = await api.get("/packages");
      return response.data as Package[];
    },
  });

  // Create package mutation
  const createMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      return api.post("/packages", {
        ...data,
        durationDays: Number(data.durationDays),
      });
    },
    onSuccess: () => {
      toast.success("Package created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      handleCloseModal();
    },
    onError: () => {
      toast.error("Failed to create package");
    },
  });

  // Update package mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PackageFormData> }) => {
      return api.patch(`/packages/${id}`, {
        ...data,
        durationDays: data.durationDays ? Number(data.durationDays) : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Package updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      handleCloseModal();
    },
    onError: () => {
      toast.error("Failed to update package");
    },
  });

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      investmentMin: pkg.investmentMin,
      investmentMax: pkg.investmentMax,
      dailyReturnPct: pkg.dailyReturnPct,
      durationDays: pkg.durationDays,
      capitalReturn: pkg.capitalReturn,
      isActive: pkg.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Package name is required");
      return;
    }
    if (!formData.investmentMin || isNaN(Number(formData.investmentMin))) {
      toast.error("Valid minimum investment is required");
      return;
    }
    if (!formData.investmentMax || isNaN(Number(formData.investmentMax))) {
      toast.error("Valid maximum investment is required");
      return;
    }
    if (!formData.dailyReturnPct || isNaN(Number(formData.dailyReturnPct))) {
      toast.error("Valid daily return percentage is required");
      return;
    }
    if (!formData.durationDays || formData.durationDays <= 0) {
      toast.error("Valid duration in days is required");
      return;
    }
    if (!formData.capitalReturn || isNaN(Number(formData.capitalReturn))) {
      toast.error("Valid capital return is required");
      return;
    }

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center text-destructive">
            Failed to load packages. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <PackageIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Packages Management</h1>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create New Package
        </Button>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Min Investment</TableHead>
                <TableHead>Max Investment</TableHead>
                <TableHead>Daily Return %</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Capital Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No packages found. Create your first package.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{formatCurrency(pkg.investmentMin)}</TableCell>
                    <TableCell>{formatCurrency(pkg.investmentMax)}</TableCell>
                    <TableCell>{pkg.dailyReturnPct}%</TableCell>
                    <TableCell>{pkg.durationDays} days</TableCell>
                    <TableCell>{pkg.capitalReturn}%</TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(pkg)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {packages.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No packages found. Create your first package.
            </CardContent>
          </Card>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <Badge variant={pkg.isActive ? "default" : "secondary"}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Min Investment:</span>
                    <p className="font-medium">{formatCurrency(pkg.investmentMin)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Investment:</span>
                    <p className="font-medium">{formatCurrency(pkg.investmentMax)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Return:</span>
                    <p className="font-medium">{pkg.dailyReturnPct}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{pkg.durationDays} days</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Capital Return:</span>
                    <p className="font-medium">{pkg.capitalReturn}%</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenEdit(pkg)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Package
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter package name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investmentMin">Min Investment ($)</Label>
                <Input
                  id="investmentMin"
                  type="number"
                  step="0.01"
                  value={formData.investmentMin}
                  onChange={(e) => setFormData({ ...formData, investmentMin: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investmentMax">Max Investment ($)</Label>
                <Input
                  id="investmentMax"
                  type="number"
                  step="0.01"
                  value={formData.investmentMax}
                  onChange={(e) => setFormData({ ...formData, investmentMax: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyReturnPct">Daily Return %</Label>
                <Input
                  id="dailyReturnPct"
                  type="number"
                  step="0.01"
                  value={formData.dailyReturnPct}
                  onChange={(e) => setFormData({ ...formData, dailyReturnPct: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={formData.durationDays || ""}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capitalReturn">Capital Return %</Label>
              <Input
                id="capitalReturn"
                type="number"
                step="0.01"
                value={formData.capitalReturn}
                onChange={(e) => setFormData({ ...formData, capitalReturn: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPackage ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;
