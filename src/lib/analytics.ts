/**
 * Lightweight product analytics for click journeys and page views.
 * Set VITE_ANALYTICS_INGEST_URL to your Express ingest endpoint (e.g. https://api.example.com/v1/analytics/events).
 * When unset, tracking is a no-op.
 */

const SESSION_KEY = "mc_analytics_session";

function getIngestUrl(): string | undefined {
  const url = import.meta.env.VITE_ANALYTICS_INGEST_URL;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
}

function readMemberId(): string | undefined {
  try {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return undefined;
    const profile = JSON.parse(raw) as { memberId?: string };
    return typeof profile?.memberId === "string" ? profile.memberId : undefined;
  } catch {
    return undefined;
  }
}

export type AnalyticsPayload = {
  type: "click" | "page_view" | "custom";
  name: string;
  category?: string;
  path: string;
  href?: string;
  tag?: string;
  properties?: Record<string, unknown>;
  sessionId: string;
  memberId?: string;
  ts: string;
};

function buildBasePayload(
  type: AnalyticsPayload["type"],
  name: string,
  extra?: Partial<
    Pick<AnalyticsPayload, "category" | "href" | "tag" | "properties" | "path">
  >,
): AnalyticsPayload {
  const defaultPath = `${window.location.pathname}${window.location.search}`;
  const { path: pathOverride, ...rest } = extra ?? {};
  return {
    type,
    name,
    path: pathOverride ?? defaultPath,
    sessionId: getOrCreateSessionId(),
    memberId: readMemberId(),
    ts: new Date().toISOString(),
    ...rest,
  };
}

function send(payload: AnalyticsPayload): void {
  const url = getIngestUrl();
  if (!url) return;

  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "omit",
  }).catch(() => {});
}

/** Imperative tracking (forms, modals, API success paths). */
export function track(
  name: string,
  properties?: Record<string, unknown>,
  category?: string,
): void {
  send(buildBasePayload("custom", name, { category, properties }));
}

export function trackPageView(pathOverride?: string): void {
  const path =
    pathOverride ?? `${window.location.pathname}${window.location.search}`;
  send(buildBasePayload("page_view", "page_view", { path }));
}

function parseMeta(raw: string | null): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

let delegationBound = false;

/**
 * Delegated clicks: add data-analytics="event_name" on buttons or links.
 * Optional: data-analytics-category, data-analytics-meta='{"key":"value"}'
 */
export function initAnalyticsClickDelegation(): void {
  if (delegationBound || typeof document === "undefined") return;
  delegationBound = true;

  document.addEventListener(
    "click",
    (event) => {
      if (!getIngestUrl()) return;
      const el = (event.target as Element | null)?.closest?.(
        "[data-analytics]",
      );
      if (!el) return;

      const name = el.getAttribute("data-analytics");
      if (!name) return;

      const category = el.getAttribute("data-analytics-category") ?? undefined;
      const meta = parseMeta(el.getAttribute("data-analytics-meta"));

      let href: string | undefined;
      if (el instanceof HTMLAnchorElement) href = el.href || undefined;

      send(
        buildBasePayload("click", name, {
          category,
          href,
          tag: el.tagName.toLowerCase(),
          properties: meta,
        }),
      );
    },
    true,
  );
}
