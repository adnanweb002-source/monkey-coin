import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, Loader2, Download, Users, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";
import api, { getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SeedPowerAccountsResponse {
  fileName?: string;
  csv: string;
  totalPowerAccountsCreated: number;
  totalSubAccountsCreated: number;
}

const getXlsxFileName = (input?: string) => {
  const base = (input || `power-accounts-${Date.now()}.csv`).replace(/\.csv$/i, "");
  return `${base}.xlsx`;
};

const downloadCsvAsExcel = (csvData: string, fileName?: string) => {
  const workbook = XLSX.read(csvData, { type: "string" });
  const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getXlsxFileName(fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AdminPowerSheet = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<SeedPowerAccountsResponse>("/admin/seed-power-accounts", {},
        {
          timeout: 200000000, // longer timeout for heavy operation
        });
      return response.data;
    },
    onSuccess: (data) => {
      if (!data?.csv?.trim()) {
        toast({
          title: t("common.error"),
          description: t("adminPowerSheet.emptyCsv"),
          variant: "destructive",
        });
        return;
      }

      downloadCsvAsExcel(data.csv, data.fileName);

      toast({
        title: t("common.success"),
        description: t("adminPowerSheet.downloadSuccess", {
          powerCount: data.totalPowerAccountsCreated,
          subCount: data.totalSubAccountsCreated,
        }),
      });
    },
    onError: (error) => {
      toast({
        title: t("adminPowerSheet.generateFailed"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminPowerSheet.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("adminPowerSheet.subtitle")}</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{t("adminPowerSheet.cardTitle")}</CardTitle>
          <CardDescription>{t("adminPowerSheet.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {t("adminPowerSheet.powerAccountsLabel")}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("adminPowerSheet.powerAccountsDesc")}
              </p>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <UserPlus className="h-4 w-4 text-primary" />
                {t("adminPowerSheet.subAccountsLabel")}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("adminPowerSheet.subAccountsDesc")}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
            {t("adminPowerSheet.infoNote")}
          </div>

          <Button
            size="lg"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="w-full md:w-auto"
          >
            {seedMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("adminPowerSheet.generating")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t("adminPowerSheet.generateAndDownload")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPowerSheet;
