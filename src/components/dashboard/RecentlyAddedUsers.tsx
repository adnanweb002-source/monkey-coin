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
import UserAvatar from "@/components/common/UserAvatar";

interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  memberId: string;
  name: string;
  email: string;
  createdAt: string;
  status: string;
  avatarId?: string;
  country?: string;
  activePackageCount?: number;
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
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
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
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium"></th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Member ID</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Country</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isActive = (user.activePackageCount ?? 0) > 0;
                return (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-2 pr-2">
                      <UserAvatar avatarId={user.avatarId} size="sm" />
                    </td>
                    <td className="py-2 pr-2 text-xs text-muted-foreground whitespace-nowrap">
                      {user.createdAt && format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="py-2 pr-2 text-xs font-mono text-muted-foreground">
                      {user.memberId}
                    </td>
                    <td className="py-2 pr-2 text-xs text-foreground font-medium truncate max-w-[120px]">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-2 pr-2 text-xs text-muted-foreground">
                      {user.country || "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-green-500/15 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentlyAddedUsers;
