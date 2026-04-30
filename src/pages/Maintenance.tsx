import { Construction, LockKeyhole, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { FaWhatsapp } from "react-icons/fa";
import { RiTelegramLine } from "react-icons/ri";
import { MdOutlineMail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SUPPORT_EMAIL,
  openSupportEmail,
  openSupportTelegram,
  openSupportWhatsapp,
} from "@/lib/supportContact";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo-auth.png";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

export default function Maintenance() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const logo =
    theme === "dark"
      ? logoDark
      : theme === "light"
        ? logoLight
        : logoImg;

  return (
    <div className="relative min-h-screen gradient-bg flex items-center justify-center p-6 overflow-hidden">
      {/* Subtle grid + scanlines for institutional / SOC feel — high contrast avoided */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-[20%] right-[-15%] w-[min(100vw,36rem)] h-[min(100vw,36rem)] rounded-full bg-primary/12 blur-[100px]" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[min(110vw,42rem)] h-[min(110vw,42rem)] rounded-full bg-accent/25 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,24rem)] h-[min(80vw,24rem)] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <Card className="relative z-[1] w-full max-w-lg overflow-hidden border-border/70 bg-card/85 backdrop-blur-xl shadow-[0_0_0_1px_hsl(var(--border)_/_0.35)] animate-in fade-in-0 zoom-in-95 duration-500 rounded-xl">
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-90 rounded-[inherit]"
          style={{ boxShadow: "var(--card-glow), var(--gold-glow)" }}
          aria-hidden
        />
        {/* Top authenticated trim */}
        <div className="relative h-1 w-full rounded-t-[inherit] overflow-hidden bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
        <CardContent className="relative pt-8 pb-10 px-8 sm:px-10 flex flex-col items-center text-center gap-6">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-full max-w-[16rem] h-24 rounded-xl bg-background/40 border border-border/60 px-5 py-3 shadow-inner">
              <img
                src={logo}
                alt="Vaultire Infinite"
                className="max-h-[4.75rem] w-auto object-contain select-none mx-auto"
                draggable={false}
                decoding="async"
              />
            </div>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase">
                {t("maintenance.secureRibbon")}
              </span>
            </div>
          </div>

          <div className="relative mx-auto">
            <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl bg-primary/12 border border-primary/30 text-primary shadow-[var(--gold-glow)]">
              <Construction className="h-[2.15rem] w-[2.15rem]" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="absolute -inset-2.5 rounded-[1.4rem] border border-primary/15 pointer-events-none" />
          </div>

          <div className="space-y-3 w-full">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              {t("maintenance.badge")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-poppins tracking-tight px-1">
              {t("maintenance.headline")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
              {t("maintenance.description")}
            </p>
          </div>

          <div
            className="w-full rounded-xl border border-border/80 bg-secondary/35 text-left px-4 py-3.5 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <h2 className="sr-only">{t("maintenance.securityHeading")}</h2>
            <div className="flex gap-3">
              <LockKeyhole className="h-5 w-5 shrink-0 text-primary mt-0.5" strokeWidth={2} aria-hidden />
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                {t("maintenance.securityNote")}
              </p>
            </div>
          </div>

          <div className="w-full space-y-3 pt-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {t("maintenance.needHelp")}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug px-1 -mt-2">
              {t("maintenance.verifiedContacts")}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-2 py-4 border-emerald-500/25 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                onClick={openSupportWhatsapp}
              >
                <FaWhatsapp className="h-6 w-6 text-emerald-400" aria-hidden />
                <span className="text-xs font-medium">WhatsApp</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-2 py-4 border-sky-500/25 hover:bg-sky-500/10 hover:border-sky-500/40"
                onClick={openSupportTelegram}
              >
                <RiTelegramLine className="h-6 w-6 text-sky-400" aria-hidden />
                <span className="text-xs font-medium">Telegram</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-2 py-4 sm:col-span-1 border-primary/30 hover:bg-primary/10"
                onClick={() =>
                  openSupportEmail(t("maintenance.emailSubject"))
                }
              >
                <MdOutlineMail className="h-6 w-6 text-primary" aria-hidden />
                <span className="text-xs font-medium leading-tight break-all text-center">Mail</span>
              </Button>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 tracking-wide px-2 border-t border-border/50 pt-5 w-full">
            © {new Date().getFullYear()} Vaultire Infinite
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
