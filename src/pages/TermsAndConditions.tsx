import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsAndConditions = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="text-primary" size={20} /></div>
        <h1 className="text-2xl font-bold text-foreground">{t("termsAndConditions.title")}</h1>
      </div>
      <div className="bg-card rounded-lg border border-border p-6 space-y-6 text-sm text-muted-foreground">
        {[1,2,3,4,5,6,7,8,9].map((i) => (
          <section key={i} className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t(`termsAndConditions.section${i}Title`)}</h2>
            <p>{t(`termsAndConditions.section${i}Content`)}</p>
          </section>
        ))}
        <p className="text-xs text-muted-foreground pt-4 border-t border-border">{t("termsAndConditions.lastUpdated")}</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
