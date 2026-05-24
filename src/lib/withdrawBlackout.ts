const TORONTO_TZ = "America/Toronto";

/** Toronto calendar date (YYYY-MM-DD) when withdrawals are paused for Memorial Day. */
export const MEMORIAL_DAY_WITHDRAWAL_BLACKOUT = "2026-05-25";

export function getTorontoCalendarDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isMemorialDayWithdrawalBlackout(
  date: Date = new Date(),
): boolean {
  return getTorontoCalendarDate(date) === MEMORIAL_DAY_WITHDRAWAL_BLACKOUT;
}
