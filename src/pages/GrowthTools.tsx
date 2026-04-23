import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import AffiliateLinksCard from "@/components/dashboard/AffiliateLinksCard";
import { Download, FileText, Languages, PackageIcon } from "lucide-react";
import { UserProfile } from "@/types/user";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lazy, Suspense, useMemo, useState } from "react";
import { publicFileUrl } from "@/lib/utils";

const OptimizedBusinessPdfViewer = lazy(() =>
  import("@/components/growth/OptimizedBusinessPdfViewer").then((m) => ({
    default: m.OptimizedBusinessPdfViewer,
  }))
);

const businessPresentationPdfs = [
  { language: "Arabic", fileName: "BUSINESS PRESENTATION ARABIC.pdf" },
  { language: "English", fileName: "BUSINESS PRESENTATION ENGLISH-1.pdf" },
  { language: "Filipino", fileName: "BUSINESS PRESENTATION FILIPINO.pdf" },
  { language: "French", fileName: "BUSINESS PRESENTATION FRENCH.pdf" },
  { language: "Hindi", fileName: "BUSINESS PRESENTATION HINDI.pdf" },
  { language: "Indonesian", fileName: "BUSINESS PRESENTATION INDONASIAN.pdf" },
  { language: "Korean", fileName: "BUSINESS PRESENTATION KOREAN.pdf" },
  { language: "Malay", fileName: "BUSINESS PRESENTATION MALAY.pdf" },
  { language: "Polish", fileName: "BUSINESS PRESENTATION POLISH.pdf" },
  { language: "Romanian", fileName: "BUSINESS PRESENTATION ROMANIAN.pdf" },
  { language: "Russian", fileName: "BUSINESS PRESENTATION RUSSIAN.pdf" },
  { language: "Spanish", fileName: "BUSINESS PRESENTATION SPANISH.pdf" },
  { language: "Thai", fileName: "BUSINESS PRESENTATION THAI.pdf" },
  { language: "Turkish", fileName: "BUSINESS PRESENTATION TURKISH.pdf" },
  { language: "Vietnamese", fileName: "BUSINESS PRESENTATION VIETNAMIES.pdf" },
] as const;

const GrowthTools = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<typeof businessPresentationPdfs[number]["language"]>(businessPresentationPdfs[1].language);
  const { data: packages = [], isLoading: isLoadingPackages, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api.get("/packages")).data,
  });

  let user: UserProfile | null = null;
  try { const profileStr = localStorage.getItem("userProfile"); if (profileStr) user = JSON.parse(profileStr); } catch {}

  const activePresentation = useMemo(
    () => businessPresentationPdfs.find((pdf) => pdf.language === selectedLanguage) ?? businessPresentationPdfs[0],
    [selectedLanguage]
  );

  const activePdfUrl = useMemo(
    () => publicFileUrl(activePresentation.fileName),
    [activePresentation.fileName]
  );

  if (isLoadingPackages) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-foreground">{t("packages.title")}</h1><p className="text-muted-foreground mt-1">{t("packages.subtitle")}</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-foreground">{t("growthTools.title")}</h1><p className="text-muted-foreground mt-1">{t("growthTools.subtitle")}</p></div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4"><PackageIcon size={28} className="text-destructive" /></div>
          <p className="text-destructive text-lg font-medium">{t("growthTools.failedToLoad")}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("growthTools.tryAgainLater")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("growthTools.title")}</h1>
        <p className="text-muted-foreground mt-1 mb-6">{t("growthTools.subtitle")}</p>
        <AffiliateLinksCard user={user} />
      </div>

      <section className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Business Presentation
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preview and download the presentation in your preferred language.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              PDF Language
            </label>
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as (typeof businessPresentationPdfs)[number]["language"])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {businessPresentationPdfs.map((pdf) => (
                  <SelectItem key={pdf.language} value={pdf.language}>
                    {pdf.language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-border/80 bg-background">
              <Skeleton className="h-[min(60vh,720px)] w-full max-w-3xl" />
            </div>
          }
        >
          <OptimizedBusinessPdfViewer fileUrl={activePdfUrl} className="shadow-sm" />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing: <span className="font-medium text-foreground">{activePresentation.language}</span>
          </p>
          <Button asChild>
            <a href={activePdfUrl} download={activePresentation.fileName}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default GrowthTools;
