import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface QueryReply {
  id: number;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
}

interface AdminSupportQuery {
  id: number;
  message: string;
  status: "OPEN" | "CLOSED" | "PENDING";
  createdAt: string;
  updatedAt: string;
  replies: QueryReply[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    memberId: string;
  };
}

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  CLOSED: "bg-green-500/20 text-green-500 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
};

const AdminSupportQueries = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewQuery, setViewQuery] = useState<AdminSupportQuery | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-support-queries", page, statusFilter],
    queryFn: async () => {
      const response = await api.get("/utility/admin/queries", {
        params: {
          skip: page * PAGE_SIZE,
          take: PAGE_SIZE,
          ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
        },
      });
      return response.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ queryId, message }: { queryId: number; message: string }) => {
      const response = await api.post(`/utility/queries/${queryId}/reply`, { message });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Reply sent successfully" });
      setReplyMessage("");
      setViewQuery(null);
      queryClient.invalidateQueries({ queryKey: ["admin-support-queries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast({ title: "Error", description: "Reply message cannot be empty", variant: "destructive" });
      return;
    }
    if (viewQuery) {
      replyMutation.mutate({ queryId: viewQuery.id, message: replyMessage.trim() });
    }
  };

  const queries = data?.data || data || [];
  const total = data?.total || queries.length || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Support Queries Management</h1>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All User Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-destructive">Failed to load queries</p>
            </div>
          ) : queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No support queries</p>
              <p className="text-sm text-muted-foreground">
                User queries will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="min-w-[200px]">Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queries.map((query: AdminSupportQuery) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-mono text-xs">
                          #{query.id}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {query.user?.firstName} {query.user?.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {query.user?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {query.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[query.status]}>
                            {query.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(query.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewQuery(query)}
                          >
                            View & Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View & Reply Modal */}
      <Dialog open={viewQuery !== null} onOpenChange={() => setViewQuery(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Query #{viewQuery?.id}
              <Badge variant="outline" className={statusColors[viewQuery?.status || "OPEN"]}>
                {viewQuery?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              From: {viewQuery?.user?.firstName} {viewQuery?.user?.lastName} ({viewQuery?.user?.email})
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-4 py-4">
              {/* Original message */}
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {viewQuery?.user?.firstName} {viewQuery?.user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {viewQuery && format(new Date(viewQuery.createdAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-foreground">{viewQuery?.message}</p>
              </div>

              {/* Replies */}
              {viewQuery?.replies?.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-lg p-4 ${
                    reply.isAdminReply
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {reply.isAdminReply ? "Admin" : viewQuery.user.firstName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.createdAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{reply.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {viewQuery?.status !== "CLOSED" && (
            <div className="space-y-2">
              <Label htmlFor="reply">Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewQuery(null)}>
              Close
            </Button>
            {viewQuery?.status !== "CLOSED" && (
              <Button onClick={handleSendReply} disabled={replyMutation.isPending}>
                {replyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportQueries;
