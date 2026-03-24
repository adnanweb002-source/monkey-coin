import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, ChevronLeft, ChevronRight, Plus, Loader2, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { RiTelegramLine } from "react-icons/ri";
import { MdOutlineMail } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

interface QueryReply { id: number; message: string; isAdminReply: boolean; createdAt: string; }
interface SupportQuery { id: number; message: string; status: "OPEN" | "CLOSED" | "PENDING"; createdAt: string; updatedAt: string; replies: QueryReply[]; }

const PAGE_SIZE = 10;
const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  CLOSED: "bg-green-500/20 text-green-500 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
};

const Support = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewQuery, setViewQuery] = useState<SupportQuery | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["support-queries", page],
    queryFn: async () => (await api.get("/utility/queries", { params: { skip: page * PAGE_SIZE, take: PAGE_SIZE } })).data,
  });

  const createMutation = useMutation({
    mutationFn: async (message: string) => (await api.post("/utility/queries", { message })).data,
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("support.querySubmitted") });
      setCreateModalOpen(false); setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["support-queries"] });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.response?.data?.message || t("support.failedToSubmit"), variant: "destructive" });
    },
  });

  const handleSubmitQuery = () => {
    if (!newMessage.trim()) { toast({ title: t("common.error"), description: t("support.messageEmpty"), variant: "destructive" }); return; }
    createMutation.mutate(newMessage.trim());
  };

  const queries = data?.data || data || [];
  const total = data?.total || queries.length || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t("support.title")}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateModalOpen(true)}><FaWhatsapp /></Button>
          <Button onClick={() => setCreateModalOpen(true)}><RiTelegramLine /></Button>
          <Button onClick={() => setCreateModalOpen(true)}><MdOutlineMail /></Button>
          <Button onClick={() => setCreateModalOpen(true)}><Plus className="mr-2 h-4 w-4" />{t("support.raiseNewQuery")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("support.yourQueries")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12"><p className="text-lg font-medium text-destructive">{t("support.failedToLoadQueries")}</p></div>
          ) : queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">{t("support.noQueries")}</p>
              <p className="text-sm text-muted-foreground">{t("support.getStarted")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("wallet.id")}</TableHead>
                      <TableHead className="min-w-[200px]">{t("notifications.message")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("support.created")}</TableHead>
                      <TableHead>{t("support.lastUpdated")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queries.map((query: SupportQuery) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-mono text-xs">#{query.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{query.message}</TableCell>
                        <TableCell><Badge variant="outline" className={statusColors[query.status]}>{query.status}</Badge></TableCell>
                        <TableCell>{format(new Date(query.createdAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{format(new Date(query.updatedAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => setViewQuery(query)}>{t("common.view")}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">{t("common.page")} {page + 1} {t("common.of")} {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("support.raiseNewQuery")}</DialogTitle>
            <DialogDescription>{t("support.describeIssue")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">{t("notifications.message")}</Label>
              <Textarea id="message" placeholder={t("support.messagePlaceholder")} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmitQuery} disabled={createMutation.isPending}>
              {createMutation.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("support.submittingQuery")}</>) : (<><Send className="mr-2 h-4 w-4" />{t("common.submit")}</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewQuery !== null} onOpenChange={() => setViewQuery(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Query #{viewQuery?.id}</DialogTitle>
            <DialogDescription><Badge variant="outline" className={statusColors[viewQuery?.status || "OPEN"]}>{viewQuery?.status}</Badge></DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4 py-4">
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t("support.you")}</span>
                  <span className="text-xs text-muted-foreground">{viewQuery && format(new Date(viewQuery.createdAt), "MMM dd, yyyy HH:mm")}</span>
                </div>
                <p className="text-sm text-foreground">{viewQuery?.message}</p>
              </div>
              {viewQuery?.replies?.map((reply) => (
                <div key={reply.id} className={`rounded-lg p-4 ${reply.isAdminReply ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{reply.isAdminReply ? t("support.supportTeam") : t("support.you")}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(reply.createdAt), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <p className="text-sm text-foreground">{reply.message}</p>
                </div>
              ))}
              {(!viewQuery?.replies || viewQuery.replies.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4">{t("support.noReplies")}</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setViewQuery(null)}>{t("common.close")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
