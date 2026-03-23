import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { markAsRead, markAllAsRead } from "@/lib/notificationApi";
import { CheckCheck } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  description?: string;
  isRead: boolean;
  createdAt: string;
  redirectionRoute?: string;
}

const PAGE_SIZE = 20;

const Notifications = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    state,
    loadNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications();

  const fetchData = useCallback(
    async (currentSkip: number, append: boolean) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      try {
        const res = await api.get("/notifications", {
          params: { take: PAGE_SIZE, skip: currentSkip },
        });
        const data = res.data?.data || [];
        setItems((prev) => (append ? [...prev, ...data] : data));
        setTotal(res.data?.total || 0);
        setUnreadCount(res.data?.unreadCount || 0);
        setSkip(currentSkip + PAGE_SIZE);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to fetch notifications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchData(0, false);
  }, [fetchData]);

  const hasMore = items.length < total;

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isLoading) {
          fetchData(skip, true);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, skip, fetchData]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString();
  };

  const handleRowClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    if (n.redirectionRoute && n.redirectionRoute.trim() !== "") {
      navigate(n.redirectionRoute);
    }
  };

  const handleMarkAll = async () => {
    await handleMarkAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all your notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>All Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAll}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((n) => (
                      <TableRow
                        key={n.id}
                        onClick={() => handleRowClick(n)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          !n.isRead && "bg-accent/20 hover:bg-accent/30",
                          n.isRead && "hover:bg-muted/50",
                        )}
                      >
                        <TableCell
                          className={cn(
                            "text-sm",
                            !n.isRead && "font-semibold text-foreground",
                          )}
                        >
                          {n.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] wrap">
                          {n.message || n.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(n.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={n.isRead ? "secondary" : "default"}
                            className={cn(
                              n.isRead
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {n.isRead ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center py-4"
                >
                  {isLoadingMore && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-2">
                Showing {items.length} of {total} notifications
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
