/** Response shape from GET /admin/growth/deposits and /admin/growth/package-purchases */

export interface AdminGrowthResponse {
  metric: string;
  timezone: string;
  lookback: {
    days: number;
    weeks: number;
    months: number;
  };
  series: {
    dod: unknown[];
    wow: unknown[];
    mom: unknown[];
  };
}

export interface GrowthChartPoint {
  label: string;
  value: number;
  sortKey: number;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parseNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Sum-like fields from Prisma aggregate or API DTOs */
function extractTotal(obj: Record<string, unknown>): number {
  const keys = ["total", "amount", "value", "sum", "fiatAmount"] as const;
  for (const k of keys) {
    const n = parseNumber(obj[k]);
    if (n !== null) return n;
  }
  const nested = obj._sum;
  if (isRecord(nested)) {
    const n = parseNumber(nested.fiatAmount) ?? parseNumber(nested.amount);
    if (n !== null) return n;
  }
  return 0;
}

/** Display label + sort key from bucket timestamps or indices */
export function normalizeGrowthSeriesRow(
  raw: unknown,
  index: number,
  timezoneHint?: string,
): GrowthChartPoint {
  if (!isRecord(raw)) {
    return {
      label: `#${index + 1}`,
      value: 0,
      sortKey: index,
    };
  }

  const value = extractTotal(raw);
  let sortKey = index;

  const startIso =
    (typeof raw.bucketStart === "string" && raw.bucketStart) ||
    (typeof raw.periodStart === "string" && raw.periodStart) ||
    (typeof raw.start === "string" && raw.start) ||
    (typeof raw.from === "string" && raw.from);

  if (startIso) {
    const t = Date.parse(startIso);
    if (!Number.isNaN(t)) sortKey = t;
  }

  let label: string;
  if (typeof raw.label === "string" && raw.label.trim()) {
    label = raw.label.trim();
  } else if (typeof raw.bucket === "string" && raw.bucket.trim()) {
    label = raw.bucket.trim();
  } else if (startIso) {
    try {
      const d = new Date(startIso);
      label = d.toLocaleDateString(undefined, {
        timeZone: timezoneHint || undefined,
        month: "short",
        day: "numeric",
        year: startIso.length > 10 ? "numeric" : undefined,
      });
    } catch {
      label = startIso.slice(0, 10);
    }
  } else {
    label = `#${index + 1}`;
  }

  return { label, value, sortKey };
}

export function normalizeGrowthSeries(
  rows: unknown[] | undefined,
  timezone?: string,
): GrowthChartPoint[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const mapped = rows.map((row, i) => normalizeGrowthSeriesRow(row, i, timezone));
  return [...mapped].sort((a, b) => a.sortKey - b.sortKey);
}

export function buildGrowthQuery(params: {
  days?: string;
  weeks?: string;
  months?: string;
}): string {
  const sp = new URLSearchParams();
  const d = params.days?.trim();
  const w = params.weeks?.trim();
  const m = params.months?.trim();
  if (d !== undefined && d !== "") {
    const n = Number(d);
    if (Number.isFinite(n) && n > 0) sp.set("days", String(Math.floor(n)));
  }
  if (w !== undefined && w !== "") {
    const n = Number(w);
    if (Number.isFinite(n) && n > 0) sp.set("weeks", String(Math.floor(n)));
  }
  if (m !== undefined && m !== "") {
    const n = Number(m);
    if (Number.isFinite(n) && n > 0) sp.set("months", String(Math.floor(n)));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}
