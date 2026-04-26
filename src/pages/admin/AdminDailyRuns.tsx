import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api, { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play } from "lucide-react";

const LONG_REQUEST_MS = 300_000;

const runPackageDaily = () =>
  api.post("/admin/manual-package-daily", {}, { timeout: LONG_REQUEST_MS });

const runBinaryDaily = () =>
  api.post("/admin/manual-binary-daily", {}, { timeout: LONG_REQUEST_MS });

const AdminDailyRuns = () => {
  const { toast } = useToast();
  const [confirmKind, setConfirmKind] = useState<"package" | "binary" | null>(null);

  const packageMutation = useMutation({
    mutationFn: runPackageDaily,
    onSuccess: (res) => {
      toast({
        title: "Package daily run",
        description: (res.data as { message?: string })?.message ?? "Completed successfully.",
      });
      setConfirmKind(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const binaryMutation = useMutation({
    mutationFn: runBinaryDaily,
    onSuccess: (res) => {
      toast({
        title: "Binary daily run",
        description: (res.data as { message?: string })?.message ?? "Completed successfully.",
      });
      setConfirmKind(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const pending = packageMutation.isPending || binaryMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scheduled daily runs</h1>
        <p className="text-muted-foreground mt-1">
          Manually trigger package daily accrual or binary payout for the current business day. Use
          with care; the server may block duplicate runs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Package daily</CardTitle>
            <CardDescription>
              Runs the package daily accrual job (long-running request; keep this page open).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setConfirmKind("package")}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {packageMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run package daily
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Binary daily</CardTitle>
            <CardDescription>
              Runs binary daily payout. Fails if the current business day run is already complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => setConfirmKind("binary")}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {binaryMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run binary daily
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={confirmKind === "package"}
        onOpenChange={(o) => !o && setConfirmKind(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run package daily job?</AlertDialogTitle>
            <AlertDialogDescription>
              This may take several minutes. Do not close the tab until it finishes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                packageMutation.mutate();
              }}
            >
              {packageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                  Running…
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmKind === "binary"}
        onOpenChange={(o) => !o && setConfirmKind(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run binary daily payout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will execute binary daily payout for the current business day if not already
              completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                binaryMutation.mutate();
              }}
            >
              {binaryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                  Running…
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDailyRuns;
