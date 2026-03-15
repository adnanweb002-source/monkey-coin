import { useQuery } from "@tanstack/react-query";
import { getMyTargets, type UserTarget } from "@/lib/userTargetsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const UserTargets = () => {
  const { data: targets = [], isLoading } = useQuery({
    queryKey: ["my-targets"],
    queryFn: getMyTargets,
  });

  console.log(targets)

  const activeTarget = targets.find((t) => !t.completed) || targets[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Targets</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!targets.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Targets</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Target size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No targets assigned</p>
            <p className="text-muted-foreground/70 text-sm mt-1">You currently have no active targets.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Targets</h1>
      </div>

      {/* Notification Banner */}
      {activeTarget && !activeTarget.completed && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Your target is based on <strong>{activeTarget.salesType}</strong> sales.
            {activeTarget.salesType === "DIRECT"
              ? " Only business from your direct referrals counts toward this target."
              : " Business from your full downline counts toward this target."}
            {" "}You must reach the target to unlock withdrawals.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {activeTarget && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Given</p>
                  <p className="text-lg font-semibold">${activeTarget.targetAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Achieved</p>
                  <p className="text-lg font-semibold">${activeTarget.achieved.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Remaining</p>
                  <p className="text-lg font-semibold">${((activeTarget.targetAmount) - (activeTarget.achieved)).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Info size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Type</p>
                  <p className="text-lg font-semibold">{activeTarget.salesType}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {activeTarget && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Target Progress</span>
              <Badge variant={activeTarget.completed ? "default" : "secondary"}>
                {activeTarget.completed ? "Completed" : "Running"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const progress = activeTarget.targetAmount > 0
                ? Math.min((activeTarget.achieved / activeTarget.targetAmount) * 100, 100)
                : 0;
              return (
                <>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${activeTarget.achieved.toLocaleString()} / ${activeTarget.targetAmount.toLocaleString()}</span>
                    <span className="font-medium text-foreground">{progress.toFixed(1)}% completed</span>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* All Targets Table */}
      {targets.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Target Amount</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Achieved</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Remaining</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t, idx) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">{idx + 1}</td>
                      <td className="py-2 pr-4">${t.targetAmount.toLocaleString()}</td>
                      <td className="py-2 pr-4">${t.achieved.toLocaleString()}</td>
                      <td className="py-2 pr-4">${t.remaining.toLocaleString()}</td>
                      <td className="py-2 pr-4"><Badge variant="outline">{t.salesType}</Badge></td>
                      <td className="py-2">
                        <Badge variant={t.completed ? "default" : "secondary"}>
                          {t.completed ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                          ) : "Running"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserTargets;
