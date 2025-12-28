import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Users, RefreshCw, Search, UserPlus, Package } from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: number;
  memberId: string;
  name: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  activePackages?: number;
  packages?: { name: string; status: string }[];
}

interface ReferralData {
  directCount: number;
  directReferrals: Referral[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  INACTIVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TrackReferral = () => {
  const [data, setData] = useState<ReferralData | null>(null);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/tree/referrals");
      setData(response.data);
      setFilteredReferrals(response.data.directReferrals || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch referrals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    if (!data?.directReferrals) return;

    const filtered = data.directReferrals.filter((referral) => {
      const query = searchQuery.toLowerCase();
      return (
        referral.memberId.toLowerCase().includes(query) ||
        referral.name.toLowerCase().includes(query) ||
        (referral.email && referral.email.toLowerCase().includes(query))
      );
    });

    // Sort by latest joined
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredReferrals(filtered);
  }, [searchQuery, data]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const getPackageCount = (referral: Referral) => {
    if (referral.activePackages !== undefined) {
      return referral.activePackages;
    }
    if (referral.packages) {
      return referral.packages.filter((p) => p.status === "ACTIVE").length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Track Referral</h1>
        <p className="text-muted-foreground">
          View and manage your direct referrals
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Direct Referrals</p>
              {isLoading ? (
                <Skeleton className="h-9 w-24 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {data?.directCount || 0}
                </p>
              )}
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Member ID, Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchReferrals} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus size={18} />
            Direct Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReferrals.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined On</TableHead>
                      <TableHead className="text-center">Active Packages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-mono text-sm">
                          {referral.memberId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {referral.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[referral.status] || ""}
                          >
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(referral.createdAt)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            <Package className="h-3 w-3 mr-1" />
                            {getPackageCount(referral)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="p-4 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-foreground">{referral.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {referral.memberId}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[referral.status] || ""}
                      >
                        {referral.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Joined: {formatDate(referral.createdAt)}
                      </span>
                      <Badge variant="secondary">
                        <Package className="h-3 w-3 mr-1" />
                        {getPackageCount(referral)} packages
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No referrals found</p>
              <p className="text-sm">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start referring members to see them here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackReferral;
