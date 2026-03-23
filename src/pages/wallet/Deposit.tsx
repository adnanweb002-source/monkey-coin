import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, ArrowRight, Bitcoin, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import CryptoDepositForm from "@/components/wallet/CryptoDepositForm";
import CryptoQRModal from "@/components/wallet/CryptoQRModal";

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

const Deposit = () => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoDepositData, setCryptoDepositData] = useState<CryptoDepositData | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: t("wallet.invalidAmount"), description: t("wallet.invalidAmountDescription"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/wallet/deposit-request", { amount, method, reference });
      toast({ title: t("wallet.depositRequestSubmitted"), description: t("wallet.depositRequestSuccess") });
      navigate("/wallet/deposit-requests");
    } catch (error: any) {
      toast({ title: t("common.error"), description: error?.response?.data?.message || "Failed to submit deposit request", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCryptoDepositCreated = (data: CryptoDepositData) => {
    setCryptoDepositData(data);
    setIsQRModalOpen(true);
  };

  const handlePaymentComplete = () => { navigate("/wallet/deposit-history"); };
  const handleQRModalClose = () => { setIsQRModalOpen(false); setCryptoDepositData(null); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("wallet.depositTitle")}</h1>
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-1 bg-primary text-primary-foreground hover:bg-primary/90 p-1 rounded-lg">
          <TabsTrigger value="crypto" className="flex items-center gap-2 font-bold bg-transparent border-0 data-[state=active]:bg-primary/90 data-[state=active]:text-white">
            <Bitcoin className="h-4 w-4" />
            {t("wallet.depositInvestGrow")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="mt-8">
          <CryptoDepositForm onDepositCreated={handleCryptoDepositCreated} />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">{t("wallet.manualDepositRequest")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">{t("wallet.scanQRComplete")}</p>
              </div>
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
                  {t("wallet.proceedToDepositForm")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("wallet.amountRequired")}</Label>
                    <Input id="amount" type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" placeholder={t("wallet.enterAmount")} value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">{t("wallet.methodOptional")}</Label>
                    <Input id="method" type="text" placeholder={t("wallet.methodPlaceholder")} value={method} onChange={(e) => setMethod(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">{t("wallet.transactionReference")}</Label>
                    <Input id="reference" type="text" placeholder={t("wallet.enterTransactionReference")} value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">{t("common.cancel")}</Button>
                    <Button type="submit" disabled={isLoading || !amount || parseFloat(amount) <= 0} className="flex-1">
                      {isLoading ? t("wallet.submitting") : t("wallet.submitDeposit")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <CryptoQRModal isOpen={isQRModalOpen} depositData={cryptoDepositData} onClose={handleQRModalClose} onPaymentComplete={handlePaymentComplete} />
    </div>
  );
};

export default Deposit;
