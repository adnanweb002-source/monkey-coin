import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, RefreshCw, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api, { getErrorMessage } from "@/lib/api";
import type { DownlineMembersResponse } from "@/types/downline";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

type DownlineMode = "binary" | "referral";

const DownlineView = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<DownlineMode>("binary");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const endpoint = useMemo(
    () =>
      mode === "binary"
        ? "/tree/downline/members"
        : "/tree/downline/sponsor-members",
    [mode],
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["downline-members", mode, page, debouncedSearch],
    queryFn: async () => {
      const res = await api.get<DownlineMembersResponse>(endpoint, {
        params: {
          page,
          pageSize: PAGE_SIZE,
          ...(debouncedSearch ? { memberId: debouncedSearch } : {}),
        },
      });
      return res.data;
    },
  });

  const setModeAndReset = (next: DownlineMode) => {
    setMode(next);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  };

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const rows = data?.data ?? [];

  const formatMoney = (s: string) => {
    const n = parseFloat(s || "0");
    if (Number.isNaN(n)) return s;
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("downlineView.title")}
      </h1>

      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("downlineView.totalUsers")}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "—" : total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("downlineView.viewMode")}
              </span>
              <div className="inline-flex rounded-lg border border-border bg-background p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setModeAndReset("binary")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                    mode === "binary"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t("downlineView.binaryDownline")}
                </button>
                <button
                  type="button"
                  onClick={() => setModeAndReset("referral")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                    mode === "referral"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t("downlineView.directReferrals")}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("downlineView.searchMemberId")}
            className="pl-9 h-9"
            aria-label={t("downlineView.searchMemberId")}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-end sm:self-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          {t("common.refresh")}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {t("downlineView.empty")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("downlineView.memberId")}</TableHead>
                    <TableHead>{t("downlineView.name")}</TableHead>
                    <TableHead>{t("auth.email")}</TableHead>
                    <TableHead>{t("downlineView.phone")}</TableHead>
                    <TableHead>{t("downlineView.status")}</TableHead>
                    <TableHead>{t("downlineView.position")}</TableHead>
                    {/* <TableHead className="text-right">
                      {t("downlineView.rank")}
                    </TableHead> */}
                    <TableHead className="text-right">
                      {t("downlineView.activePackages")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("downlineView.totalDeposits")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("downlineView.totalWithdrawals")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("downlineView.totalPackage")}
                    </TableHead>
                    <TableHead>{t("downlineView.joined")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {r.memberId}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r.firstName} {r.lastName}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {r.email}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.phoneNumber ?? "—"}
                      </TableCell>
                      <TableCell>
                        {String(r.status).toUpperCase() === "SUSPENDED" ? (
                          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                            {t("downlineView.statusSuspended")}
                          </Badge>
                        ) : r.activePackageCount > 0 ? (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                            {t("common.active")}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                            {t("common.inactive")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.position ?? "—"}
                      </TableCell>
                      {/* <TableCell className="text-right tabular-nums">
                        {r.currentRank}
                      </TableCell> */}
                      <TableCell className="text-right tabular-nums">
                        {r.activePackageCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">
                          ${Number(r.totalDeposits).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-600 font-medium">
                          ${Number(r.totalWithdrawals).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${formatMoney(r.totalPackageAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t("downlineView.showingRange", {
                    from: (page - 1) * PAGE_SIZE + 1,
                    to: Math.min(page * PAGE_SIZE, total),
                    total,
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("common.previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("downlineView.pageOf", { page, totalPages })}
                  </span>
                  <select
                    value={page}
                    onChange={(e) =>
                      setPage(
                        Math.max(
                          1,
                          Math.min(totalPages, Number(e.target.value)),
                        ),
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    aria-label={t("downlineView.jumpToPage")}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <option key={pageNum} value={pageNum}>
                          {pageNum}
                        </option>
                      ),
                    )}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isLoading}
                    onClick={() =>
                      setPage((p) => (p < totalPages ? p + 1 : p))
                    }
                  >
                    {t("common.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DownlineView;
