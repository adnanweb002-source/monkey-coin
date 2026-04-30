/** Contact channels — shared by Support & maintenance flows */
export const SUPPORT_WHATSAPP_URL = "https://wa.link/8rhovc" as const;
export const SUPPORT_TELEGRAM_URL = "https://t.me/vaultireinfinite" as const;
export const SUPPORT_EMAIL = "support@vaultireinfinite.com" as const;

export function openSupportWhatsapp() {
  window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener,noreferrer");
}

export function openSupportTelegram() {
  window.open(SUPPORT_TELEGRAM_URL, "_blank", "noopener,noreferrer");
}

export function openSupportEmail(subject?: string) {
  const q = subject
    ? `?subject=${encodeURIComponent(subject)}`
    : "";
  window.location.href = `mailto:${SUPPORT_EMAIL}${q}`;
}
