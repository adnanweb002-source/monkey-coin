import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

interface Holiday { id: number; title: string; date: string; type: string; }
const HOLIDAY_TYPES = ["global", "india", "national", "regional", "optional"];

const HolidayList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formType, setFormType] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) { try { setIsAdmin(JSON.parse(stored)?.role === "ADMIN"); } catch { setIsAdmin(false); } }
  }, []);

  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => { const response = await api.get("/utility/holidays"); return response.data?.data || response.data || []; },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; date: string; type: string }) => api.post("/utility/holidays", data),
    onSuccess: () => { toast({ title: t("holidays.holidayCreated") }); queryClient.invalidateQueries({ queryKey: ["holidays"] }); resetForm(); setIsCreateOpen(false); },
    onError: () => { toast({ title: t("holidays.failedToCreate"), variant: "destructive" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => api.put(`/utility/holidays/${id}`, data),
    onSuccess: () => { toast({ title: t("holidays.holidayUpdated") }); queryClient.invalidateQueries({ queryKey: ["holidays"] }); resetForm(); setEditingHoliday(null); },
    onError: () => { toast({ title: t("holidays.failedToUpdate"), variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/utility/holidays/${id}`),
    onSuccess: () => { toast({ title: t("holidays.holidayDeleted") }); queryClient.invalidateQueries({ queryKey: ["holidays"] }); setDeletingHoliday(null); },
    onError: () => { toast({ title: t("holidays.failedToDelete"), variant: "destructive" }); },
  });

  const resetForm = () => { setFormTitle(""); setFormDate(undefined); setFormType(""); };

  const openEditModal = (holiday: Holiday) => { setFormTitle(holiday.title); setFormDate(new Date(holiday.date)); setFormType(holiday.type); setEditingHoliday(holiday); };

  const handleCreate = () => {
    if (!formTitle.trim() || !formDate || !formType) { toast({ title: t("holidays.fillRequired"), variant: "destructive" }); return; }
    createMutation.mutate({ title: formTitle.trim(), date: format(formDate, "yyyy-MM-dd"), type: formType });
  };

  const handleUpdate = () => {
    if (!editingHoliday || !formTitle.trim() || !formDate || !formType) { toast({ title: t("holidays.fillRequired"), variant: "destructive" }); return; }
    updateMutation.mutate({ id: editingHoliday.id, data: { title: formTitle.trim(), date: format(formDate, "yyyy-MM-dd"), type: formType } });
  };

  const handleDelete = () => { if (deletingHoliday) deleteMutation.mutate(deletingHoliday.id); };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const sortedHolidays = [...holidays].sort((a: Holiday, b: Holiday) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <div className="text-center py-12 text-destructive">{t("holidays.failedToLoad")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="text-primary" size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("holidays.title")}</h1>
            <p className="text-muted-foreground">{t("holidays.subtitle")}</p>
          </div>
        </div>
        {isAdmin && <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" />{t("holidays.addHoliday")}</Button>}
      </div>

      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("holidays.holidayTitle")}</TableHead>
              <TableHead>{t("common.type")}</TableHead>
              {isAdmin && <TableHead className="text-right">{t("common.actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHolidays.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-muted-foreground">{t("holidays.noHolidays")}</TableCell></TableRow>
            ) : sortedHolidays.map((holiday: Holiday) => (
              <TableRow key={holiday.id}>
                <TableCell className="font-medium">{formatDate(holiday.date)}</TableCell>
                <TableCell>{holiday.title}</TableCell>
                <TableCell><Badge variant={holiday.type === "global" ? "default" : "secondary"}>{holiday.type}</Badge></TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(holiday)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingHoliday(holiday)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {sortedHolidays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">{t("holidays.noHolidays")}</div>
        ) : sortedHolidays.map((holiday: Holiday) => (
          <div key={holiday.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1"><h3 className="font-semibold text-foreground">{holiday.title}</h3><p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p></div>
              <Badge variant={holiday.type === "global" ? "default" : "secondary"}>{holiday.type}</Badge>
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(holiday)}><Pencil className="h-4 w-4 mr-2" />{t("common.edit")}</Button>
                <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => setDeletingHoliday(holiday)}><Trash2 className="h-4 w-4 mr-2" />{t("common.delete")}</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isCreateOpen || !!editingHoliday} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setEditingHoliday(null); resetForm(); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingHoliday ? t("holidays.editHoliday") : t("holidays.addHoliday")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="title">{t("holidays.holidayTitle")}</Label><Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder={t("holidays.holidayTitlePlaceholder")} /></div>
            <div className="space-y-2">
              <Label>{t("holidays.dateRequired")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formDate && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />{formDate ? format(formDate, "PPP") : t("holidays.pickADate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><CalendarComponent mode="single" selected={formDate} onSelect={setFormDate} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>{t("holidays.typeRequired")}</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger><SelectValue placeholder={t("holidays.selectType")} /></SelectTrigger>
                <SelectContent>{HOLIDAY_TYPES.map((type) => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingHoliday(null); resetForm(); }}>{t("common.cancel")}</Button>
            <Button onClick={editingHoliday ? handleUpdate : handleCreate} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingHoliday ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingHoliday} onOpenChange={(open) => !open && setDeletingHoliday(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("holidays.deleteHoliday")}</AlertDialogTitle>
            <AlertDialogDescription>{t("holidays.deleteConfirm", { name: deletingHoliday?.title })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HolidayList;
