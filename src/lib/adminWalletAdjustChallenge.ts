import api from "@/lib/api";

/**
 * Must match backend `verifyDynamicAdjustKey`:
 * payload = `${memberId}:${keySalt}:${requestTs}`
 * dynamicKey = HMAC_SHA256(secret, payload).digest('hex') as UTF-8 string comparison on server
 *
 * Prefer a server endpoint so `ADMIN_WALLET_ADJUST_KEY` never ships to browsers, e.g.:
 * POST /admin/wallets/adjust-balance/challenge  body: { memberId }
 * returns { keySalt, requestTs, dynamicKey }
 */
function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  const bytes = new Uint8Array(signature);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function isMintResponse(x: unknown): x is {
  keySalt: string;
  requestTs: string;
  dynamicKey: string;
} {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.keySalt === "string" &&
    typeof o.requestTs === "string" &&
    typeof o.dynamicKey === "string" &&
    o.keySalt.length > 0 &&
    o.requestTs.length > 0 &&
    o.dynamicKey.length > 0
  );
}

async function fetchServerChallenge(memberId: string): Promise<
  | { keySalt: string; requestTs: string; dynamicKey: string }
  | null
> {
  try {
    const { data } = await api.post("/admin/wallets/adjust-balance/challenge", { memberId });
    if (isMintResponse(data)) return data;
    return null;
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 404 || status === 405) return null;
    throw e;
  }
}

function mintLocally(memberId: string, secret: string): Promise<{
  keySalt: string;
  requestTs: string;
  dynamicKey: string;
}> {
  const keySalt = randomHex(16);
  const requestTs = String(Date.now());
  const payload = `${memberId}:${keySalt}:${requestTs}`;
  return (async () => ({
    keySalt,
    requestTs,
    dynamicKey: await hmacSha256Hex(secret, payload),
  }))();
}

/**
 * Produce signing trio. Server challenge is tried first (recommended for production).
 * Falls back to VITE_ADMIN_WALLET_ADJUST_DEV_KEY only when set (unsafe for broad distribution).
 */
export async function mintWalletAdjustChallenge(memberId: string): Promise<{
  keySalt: string;
  requestTs: string;
  dynamicKey: string;
}> {
  const trimmed = memberId.trim();
  if (!trimmed) {
    throw new Error("memberId is required to mint signing payload");
  }

  const server = await fetchServerChallenge(trimmed);
  if (server) return server;

  const devSecret =
    typeof import.meta.env.VITE_ADMIN_WALLET_ADJUST_DEV_KEY === "string"
      ? import.meta.env.VITE_ADMIN_WALLET_ADJUST_DEV_KEY
      : "";
  if (!devSecret) {
    throw new Error(
      "Signing unavailable: backend must expose POST /admin/wallets/adjust-balance/challenge or set VITE_ADMIN_WALLET_ADJUST_DEV_KEY (dev-only, exposes the adjustment secret in the bundle).",
    );
  }

  return mintLocally(trimmed, devSecret);
}
