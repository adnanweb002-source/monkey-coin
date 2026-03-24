import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserRanks, getRankProgress, claimRank } from "@/lib/rankApi";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import rank1 from "@/assets/ranks/1.png";
import rank2 from "@/assets/ranks/2.png";
import rank3 from "@/assets/ranks/3.png";
import rank4 from "@/assets/ranks/4.png";
import rank5 from "@/assets/ranks/5.png";
import rank6 from "@/assets/ranks/6.png";
import rank7 from "@/assets/ranks/7.png";
import rank8 from "@/assets/ranks/8.png";
import rank9 from "@/assets/ranks/9.png";
import rank10 from "@/assets/ranks/10.png";
import rank11 from "@/assets/ranks/11.png";
import award3 from "@/assets/ranks/award-3.png";
import award4 from "@/assets/ranks/award-4.png";
import award5 from "@/assets/ranks/award-5.png";
import award6 from "@/assets/ranks/award-6.png";
import award7 from "@/assets/ranks/award-7.png";
import award8 from "@/assets/ranks/award-8.png";
import award9 from "@/assets/ranks/award-9.png";
import award10 from "@/assets/ranks/award-10.png";
import award11 from "@/assets/ranks/award-11.png";

const rankImages: Record<number, string> = { 1: rank1, 2: rank2, 3: rank3, 4: rank4, 5: rank5, 6: rank6, 7: rank7, 8: rank8, 9: rank9, 10: rank10, 11: rank11 };
const awardImages: Record<number, string> = { 3: award3, 4: award4, 5: award5, 6: award6, 7: award7, 8: award8, 9: award9, 10: award10, 11: award11 };

const AwardsAndRanks = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: ranks, isLoading } = useQuery({ queryKey: ["user-ranks"], queryFn: getUserRanks });
  const { data: progress, isLoading: progressLoading } = useQuery({ queryKey: ["rank-progress"], queryFn: getRankProgress });

  const claimMutation = useMutation({
    mutationFn: claimRank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["rank-progress"] });
      toast({ title: t("common.success") });
      setClaimingId(null);
    },
    onError: (err) => { toast({ title: t("common.error"), description: getErrorMessage(err), variant: "destructive" }); setClaimingId(null); },
  });

  const handleClaim = (rankId: string) => { setClaimingId(rankId); claimMutation.mutate(rankId); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("awardsAndRanks.title")}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t("awardsAndRanks.nextRankProgress")}</CardTitle></CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="space-y-4"><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
          ) : progress?.completed ? (
            <div className="flex items-center gap-2 text-primary"><CheckCircle className="h-5 w-5" /><span className="font-medium">{t("awardsAndRanks.allRanksCompleted")}</span></div>
          ) : progress ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("awardsAndRanks.nextRank")}: <span className="font-semibold text-foreground">{progress.rank}</span></p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>{t("awardsAndRanks.leftProgress")}</span><span className="text-muted-foreground">{progress.leftProgress.toLocaleString()} / {progress.requiredLeft.toLocaleString()}</span></div>
                <Progress value={Math.min((progress.leftProgress / progress.requiredLeft) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>{t("awardsAndRanks.rightProgress")}</span><span className="text-muted-foreground">{progress.rightProgress.toLocaleString()} / {progress.requiredRight.toLocaleString()}</span></div>
                <Progress value={Math.min((progress.rightProgress / progress.requiredRight) * 100, 100)} className="h-2" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("awardsAndRanks.noProgressData")}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-[250px]"><CardContent className="p-6 space-y-4"><Skeleton className="h-6 w-24 mx-auto" /><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>)
        ) : ranks?.length ? (
          ranks.map((rank: any) => {
            const rankImg = rankImages[rank.order];
            const awardImg = awardImages[rank.order];
            return (
              <div key={rank.id} className="group perspective">
                <div className="relative h-[240px] w-full card-flip preserve-3d">
                  <div className="absolute inset-0 backface-hidden border rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 shadow-lg overflow-visible mt-8">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 rounded-full bg-background border shadow-lg flex items-center justify-center ring-4 ring-primary/20">
                        <img src={rankImg} alt={rank.name} className="w-12 h-12 object-contain" />
                      </div>
                    </div>
                    <CardContent className="flex flex-col items-center text-center justify-between h-full pt-14 pb-5 px-6">
                      <div>
                        <h3 className="text-base font-semibold">{rank.name}</h3>
                        <p className="text-primary font-bold text-lg mt-1">${rank.reward.toLocaleString()}</p>
                        {rank.rewardTitle && <p className="text-xs text-muted-foreground mt-1">{rank.rewardTitle}</p>}
                      </div>
                      <div className="w-full">
                        {rank.claimable ? (
                          <Button size="sm" className="w-full" onClick={() => handleClaim(rank.id)} disabled={claimingId === rank.id}>
                            {claimingId === rank.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t("awardsAndRanks.claim")}
                          </Button>
                        ) : rank.claimed ? (
                          <Badge className="w-full justify-center py-2"><CheckCircle className="h-4 w-4 mr-1" />{t("common.completed")}</Badge>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center py-2 opacity-60"><Lock className="h-4 w-4 mr-1" />{t("common.locked")}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </div>
                  <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-xl border flex flex-col items-center justify-between text-center bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-cyan-500/30 shadow-[0_0_30px_rgba(99,102,241,0.6)] overflow-hidden p-5">
                    <div className="flex-1 flex items-center justify-center w-full">
                      {awardImg ? (
                        <img src={awardImg} className="max-h-[140px] object-contain opacity-90" />
                      ) : (
                        <div className="text-center"><p className="text-sm text-muted-foreground">{t("awardsAndRanks.reward")}</p><p className="text-2xl font-bold text-primary">${rank.reward.toLocaleString()}</p></div>
                      )}
                    </div>
                    <div className="w-full mt-4">
                      {rank.claimable ? (
                        <Button size="sm" className="w-full" onClick={() => handleClaim(rank.id)} disabled={claimingId === rank.id}>
                          {claimingId === rank.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t("awardsAndRanks.claim")}
                        </Button>
                      ) : rank.claimed ? (
                        <Badge className="w-full justify-center py-2"><CheckCircle className="h-4 w-4 mr-1" />{t("common.completed")}</Badge>
                      ) : (
                        <Badge variant="outline" className="w-full justify-center py-2 opacity-60"><Lock className="h-4 w-4 mr-1" />{t("common.locked")}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">{t("awardsAndRanks.noRanksAvailable")}</div>
        )}
      </div>
    </div>
  );
};

export default AwardsAndRanks;
