import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const { state, loadNotifications, handleMarkAsRead, handleMarkAllAsRead, hasMore } = useNotifications();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      await loadNotifications(true);
      setLoaded(true);
    }
  };

  const handleLoadMore = () => loadNotifications(false);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-foreground relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {state.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-medium animate-in zoom-in-50">
            {state.unreadCount > 99 ? "99+" : state.unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 md:w-96 max-h-[70vh] bg-popover border border-border rounded-xl shadow-xl z-50 flex flex-col animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {t("notifications.title", "Notifications")}
            </h3>
            {state.unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                {t("notifications.markAllRead", "Mark all read")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {state.isLoading && state.items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : state.items.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("notifications.empty", "No notifications yet")}
              </div>
            ) : (
              state.items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors",
                    !n.isRead && "bg-accent/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className={cn("flex-1 min-w-0", n.isRead && "ml-4")}>
                      <p className="text-sm font-medium text-foreground truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="border-t border-border px-4 py-2">
              <button
                onClick={handleLoadMore}
                disabled={state.isLoading}
                className="w-full text-xs text-primary hover:text-primary/80 py-1 flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
              >
                {state.isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  t("notifications.loadMore", "Load more")
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
