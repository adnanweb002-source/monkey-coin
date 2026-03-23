import { useNavigate } from "react-router-dom";
import { AlertTriangle, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface TwoFactorWarningBannerProps { isEnabled: boolean; }

const TwoFactorWarningBanner = ({ isEnabled }: TwoFactorWarningBannerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (isEnabled) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{t("twoFactor.securityWarning")}</span>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-400 flex-1">{t("twoFactor.notProtected")}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/profile", { state: { openTab: "security" } })} className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10 shrink-0">
          <Shield className="h-4 w-4 mr-2" />{t("twoFactor.enable2FA")}
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorWarningBanner;
