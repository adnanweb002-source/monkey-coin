import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";

interface RecentUser {
  id: string;
  memberId: string;
  name: string;
  email: string;
  createdAt: string;
  status: string;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

const RecentlyAddedUsers = () => {
  const [limit, setLimit] = useState(20);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recent-users", limit],
    queryFn: async () => {
      const response = await api.get(`/tree/downline/recent?limit=${limit}`);
      return response.data;
    },
  });

  // Reset scroll position when limit changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [limit, data]);

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10));
  };

  const users: RecentUser[] = data || [];

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-semibold text-foreground">Recently Added Users</h3>
        <Select value={limit.toString()} onValueChange={handleLimitChange}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt.toString()}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30"
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-destructive text-sm">Failed to load users</p>
            <p className="text-muted-foreground text-xs mt-1">Please try again later</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No users found</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Recently added users will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {user.status === "ACTIVE" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">ID: {user.memberId}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {user.createdAt && format(new Date(user.createdAt), "MMM dd")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyAddedUsers;
