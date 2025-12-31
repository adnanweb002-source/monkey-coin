import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { AlertTriangle, Loader2, Trash2, ShieldAlert } from "lucide-react";

const CONFIRM_KEYWORD = "PRUNE";

const SystemPrune = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [confirmInput, setConfirmInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin role on mount
  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        if (profile?.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          // Non-admin, redirect to dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch {
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/dashboard", { replace: true });
    }
    setIsCheckingRole(false);
  }, [navigate]);

  const isConfirmValid = confirmInput === CONFIRM_KEYWORD;

  const handlePruneClick = () => {
    if (!isConfirmValid) return;
    setError(null);
    setShowModal(true);
  };

  const handleExecutePrune = async () => {
    setShowModal(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/admin/prune-system", { confirm: CONFIRM_KEYWORD });

      console.log("System prune response:", response.data);

      toast({
        title: "System Prune Completed",
        description: "System prune completed successfully. All data has been cleared.",
      });

      // Redirect to admin dashboard
      navigate("/admin/users", { replace: true });
    } catch (err: unknown) {
      console.error("System prune error:", err);
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to execute system prune. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      setConfirmInput("");
    }
  };

  // Show loading while checking role
  if (isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Prune</h1>
          <p className="text-sm text-muted-foreground">
            Destructive Maintenance Operation
          </p>
        </div>
      </div>

      {/* Warning Card */}
      <Card className="border-destructive bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            WARNING — IRREVERSIBLE SYSTEM OPERATION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Action</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                This action will <strong>permanently delete</strong> the following data:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>All user accounts (except COMPANY root account)</li>
                <li>All wallets and wallet transactions</li>
                <li>All package purchases and income logs</li>
                <li>All deposit and withdrawal requests</li>
                <li>All support queries and replies</li>
                <li>All 2FA secrets and refresh tokens</li>
              </ul>
              <p className="font-semibold mt-3">
                This action cannot be undone. Proceed ONLY if you fully understand the consequences.
              </p>
            </AlertDescription>
          </Alert>

          {/* Confirmation Input Section */}
          <div className="pt-4 border-t border-destructive/20">
            <Label htmlFor="confirm-input" className="text-foreground font-medium">
              Type <span className="font-mono font-bold text-destructive">{CONFIRM_KEYWORD}</span> to confirm this operation
            </Label>
            <Input
              id="confirm-input"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type ${CONFIRM_KEYWORD} to confirm`}
              className="mt-2 font-mono"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={isLoading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            variant="destructive"
            size="lg"
            className="w-full mt-4"
            disabled={!isConfirmValid || isLoading}
            onClick={handlePruneClick}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Pruning System...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                PRUNE SYSTEM DATA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <p>
                System prune will <strong>permanently wipe</strong> all platform data
                except the COMPANY root account.
              </p>
              <p className="font-semibold text-destructive">
                This cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleExecutePrune}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                "Yes, Execute Prune"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemPrune;
