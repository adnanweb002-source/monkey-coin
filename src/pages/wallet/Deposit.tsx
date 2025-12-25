import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const Deposit = () => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/wallet/deposit-request", {
        amount,
        method,
        reference,
      });

      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted successfully.",
      });

      navigate("/wallet/deposit-requests");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to submit deposit request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Deposit</h1>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Fund Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
              <QrCode className="w-24 h-24 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan the QR and complete the payment.
            </p>
          </div>

          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full"
              size="lg"
            >
              Proceed to Deposit Form
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Method (Optional)</Label>
                <Input
                  id="method"
                  type="text"
                  placeholder="e.g., Bank Transfer, USDT"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Transaction Reference (Optional)</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Enter transaction reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !amount || parseFloat(amount) <= 0}
                  className="flex-1"
                >
                  {isLoading ? "Submitting..." : "Submit Deposit"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;