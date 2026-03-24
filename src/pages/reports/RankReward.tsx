import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Trophy, RefreshCw, Medal, Crown, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RankEntry { userId: number; memberId: string; teamBV: number; name?: string; }

const RankReward = () => {
  const { t } = useTranslation();
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/tree/downline/rank");
      setRankings((response.data || []).sort((a: RankEntry, b: RankEntry) => b.teamBV - a.teamBV));
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.response?.data?.message || t("reports.noRankingData"), variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRankings(); }, []);

  const formatBV = (value: number) => new Intl.NumberFormat("en-IN").format(value);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-300" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3: return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
      default: return "";
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1"><Crown className="h-3 w-3" />1st</Badge>;
      case 2: return <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/30 gap-1"><Medal className="h-3 w-3" />2nd</Badge>;
      case 3: return <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/30 gap-1"><Award className="h-3 w-3" />3rd</Badge>;
      default: return <Badge variant="outline" className="font-mono">#{rank}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">{t("reports.rankAndReward")}</h1>
        <p className="text-muted-foreground">{t("reports.teamBVLeaderboard")}</p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.totalRankedMembers")}</p>
              {isLoading ? <Skeleton className="h-9 w-24 mt-1" /> : <p className="text-3xl font-bold text-foreground">{rankings.length}</p>}
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center"><Trophy className="h-8 w-8 text-primary" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchRankings} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />{t("common.refresh")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Trophy size={18} />{t("reports.leaderboard")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : rankings.length > 0 ? (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">{t("reports.rank")}</TableHead>
                      <TableHead>{t("reports.memberIdCol")}</TableHead>
                      {rankings[0]?.name && <TableHead>{t("reports.name")}</TableHead>}
                      <TableHead className="text-right">{t("reports.teamBV")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <TableRow key={entry.userId} className={getRankStyle(rank)}>
                          <TableCell><div className="flex items-center gap-2">{getRankIcon(rank)}{getRankBadge(rank)}</div></TableCell>
                          <TableCell className="font-mono text-sm">{entry.memberId}</TableCell>
                          {entry.name && <TableCell className="font-medium">{entry.name}</TableCell>}
                          <TableCell className="text-right font-bold text-foreground">{formatBV(entry.teamBV)} BV</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {rankings.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <div key={entry.userId} className={`p-4 rounded-lg border ${rank <= 3 ? getRankStyle(rank) : "border-border bg-card/50"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">{getRankIcon(rank)}{getRankBadge(rank)}</div>
                        <span className="font-bold text-foreground text-lg">{formatBV(entry.teamBV)} BV</span>
                      </div>
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">{entry.memberId}</p>
                        {entry.name && <p className="text-sm font-medium text-foreground mt-1">{entry.name}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t("reports.noRankingData")}</p>
              <p className="text-sm">{t("reports.rankingsAppear")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankReward;
