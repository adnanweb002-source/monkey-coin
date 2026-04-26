import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface AuditActor {
  id: number;
  memberId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuditLogRow {
  id: number;
  actorId: number | null;
  actorType: string;
  action: string;
  entity: string;
  entityId: string | number | null;
  before: unknown;
  after: unknown;
  createdAt: string;
  actor: AuditActor | null;
}

interface ListResponse {
  take: number;
  skip: number;
  memberId: string | null;
  pageCount: number;
  totalCount: number;
  data: AuditLogRow[];
}

const TAKE = 20;

const AdminAuditLogs = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("1");
  const [memberId, setMemberId] = useState("");
  const [debouncedMemberId, setDebouncedMemberId] = useState("");
  const [detailLog, setDetailLog] = useState<AuditLogRow | null>(null);

  const skip = (page - 1) * TAKE;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedMemberId(memberId.trim());
      setPage(1);
      setJumpPage("1");
    }, 400);
    return () => clearTimeout(t);
  }, [memberId]);

  const { data, isLoading, isError, error, isFetching } = useQuery<ListResponse>({
    queryKey: ["admin-audit-logs", TAKE, skip, debouncedMemberId],
    queryFn: async () => {
      const params = new URLSearchParams({
        take: String(TAKE),
        skip: String(skip),
      });
      if (debouncedMemberId) params.append("memberId", debouncedMemberId);
      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / TAKE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const rows = data?.data ?? [];

  const infoLabel = useMemo(() => {
    if (!data) return "";
    const from = data.pageCount === 0 ? 0 : skip + 1;
    const to = skip + data.pageCount;
    const s = debouncedMemberId
      ? ` (member filter: ${debouncedMemberId})`
      : "";
    return `Showing ${from} to ${to} of ${data.totalCount}${s}`;
  }, [data, skip, debouncedMemberId]);

  const handleJump = () => {
    const parsed = Number(jumpPage);
    if (!Number.isFinite(parsed) || parsed < 1) {
      toast({
        title: "Invalid page",
        description: "Enter a page number greater than 0.",
        variant: "destructive",
      });
      return;
    }
    const pageNum = Math.floor(parsed);
    if (pageNum > totalPages) {
      toast({
        title: "Invalid page",
        description: `Enter a page between 1 and ${totalPages}.`,
        variant: "destructive",
      });
      return;
    }
    setPage(pageNum);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Admin and system actions with optional search by member ID (partial match on users).
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:max-w-sm">
          <Label htmlFor="audit-member">Search by Member ID</Label>
          <Input
            id="audit-member"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Partial member ID (optional)"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-destructive py-8">
                  {getErrorMessage(error)}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">#{row.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {row.actor ? (
                      <div className="text-sm">
                        <div className="font-medium">{row.actor.memberId}</div>
                        <div className="text-muted-foreground text-xs">
                          {`${row.actor.firstName} ${row.actor.lastName}`.trim()}{" "}
                          <Badge variant="secondary" className="ml-1 text-[10px]">
                            {row.actor.role}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs break-all">{row.action}</code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs break-all">{row.entity}</code>
                  </TableCell>
                  <TableCell className="text-sm max-w-[120px] truncate" title={String(row.entityId ?? "")}>
                    {row.entityId ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDetailLog(row)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {infoLabel} {isFetching ? " (refreshing...)" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!hasPrev}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="px-2 text-sm">
            Page {page} of {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Label htmlFor="jump-audit" className="text-sm">
            Jump
          </Label>
          <Input
            id="jump-audit"
            type="number"
            min={1}
            className="w-20 h-8"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
          />
          <Button variant="secondary" size="sm" onClick={handleJump}>
            Go
          </Button>
        </div>
      </div>

      <Dialog open={!!detailLog} onOpenChange={(o) => !o && setDetailLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit log #{detailLog?.id}</DialogTitle>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Action:</span>{" "}
                <code>{detailLog.action}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Before</span>
                <pre className="mt-1 p-3 rounded-md bg-muted text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(detailLog.before, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-muted-foreground">After</span>
                <pre className="mt-1 p-3 rounded-md bg-muted text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(detailLog.after, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
