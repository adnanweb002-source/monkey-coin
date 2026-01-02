import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Copy, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface CryptoDepositData {
  depositId: string;
  paymentId: string;
  currency: string;
  address: string;
  amountCrypto: string;
  amountFiat: string;
  uri: string;
  expiresAt: string;
}

interface CryptoQRModalProps {
  isOpen: boolean;
  depositData: CryptoDepositData | null;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const CryptoQRModal = ({
  isOpen,
  depositData,
  onClose,
  onPaymentComplete,
}: CryptoQRModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  // Calculate time remaining
  useEffect(() => {
    if (!depositData?.expiresAt) return;

    const calculateTimeRemaining = () => {
      const expiryTime = new Date(depositData.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [depositData?.expiresAt]);

  // Auto-close on expiry
  useEffect(() => {
    if (isExpired) {
      toast({
        title: "Deposit Expired",
        description: "The payment window has expired. Please create a new deposit.",
        variant: "destructive",
      });
      onClose();
    }
  }, [isExpired, onClose, toast]);

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!depositData?.depositId || isExpired) return;

    try {
      const response = await api.get(`/wallet/deposit-status/${depositData.depositId}`);
      const status = response.data?.status;

      if (["waiting", "confirming", "finished"].includes(status)) {
        toast({
          title: "Payment Received!",
          description: status === "finished" 
            ? "Your deposit has been confirmed successfully." 
            : "Payment detected, awaiting confirmation...",
        });
        onPaymentComplete();
        onClose();
      } else if (status === "failed") {
        toast({
          title: "Payment Failed",
          description: "The payment could not be processed. Please try again.",
          variant: "destructive",
        });
        onClose();
      }
    } catch (error) {
      // Silently handle polling errors
      console.error("Polling error:", error);
    }
  }, [depositData?.depositId, isExpired, onClose, onPaymentComplete, toast]);

  // Start polling every 5 seconds
  useEffect(() => {
    if (!isOpen || !depositData || isExpired) return;

    setIsPolling(true);
    const pollInterval = setInterval(checkPaymentStatus, 5000);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [isOpen, depositData, isExpired, checkPaymentStatus]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!depositData) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Prevent closing via backdrop click
        if (!open) return;
      }}
    >
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Complete Your Payment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Timer */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={timeRemaining < 60 ? "text-destructive font-semibold" : "text-muted-foreground"}>
              Expires in: {formatTime(timeRemaining)}
            </span>
            {isPolling && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={depositData.uri}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Amount Info */}
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold">
              {depositData.amountCrypto} {depositData.currency}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ ${depositData.amountFiat} USD
            </p>
          </div>

          {/* Details */}
          <div className="w-full space-y-3">
            {/* Address */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Address</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(depositData.address, "Address")}
                >
                  {copiedField === "Address" ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs font-mono break-all">{depositData.address}</p>
            </div>

            {/* Coin Type */}
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <span className="text-sm text-muted-foreground">Coin</span>
              <Badge variant="secondary">{depositData.currency}</Badge>
            </div>

            {/* Amount */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Amount</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(depositData.amountCrypto, "Amount")}
                >
                  {copiedField === "Amount" ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm font-mono">
                {depositData.amountCrypto} {depositData.currency}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg w-full">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Send only <strong>{depositData.currency}</strong> to this address. 
              Sending any other cryptocurrency may result in permanent loss.
            </p>
          </div>

          {/* Payment ID */}
          <p className="text-xs text-muted-foreground">
            Payment ID: {depositData.paymentId}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoQRModal;
