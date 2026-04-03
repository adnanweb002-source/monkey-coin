# Security analysis — monkey-coin-fe

**Scope:** Vite + React + TypeScript SPA. Enforcement for money, roles, and sessions lives on the **backend**; this document describes frontend behavior and misleading or weak controls.

**Date:** 2026-04-02

---

## Architecture (threat model context)

- **API:** Axios with `withCredentials: true` and `BE_URL` from `VITE_BACKEND_URL` (fallback `http://localhost:3000`). Session refresh is described as cookie-based in application code.
- **WebSocket:** Socket.IO to the same `BE_URL`, also `withCredentials: true`.
- **Auth gating:** `RequireAuth` calls `/auth/get-profile`; routes under `/panel`, `/wallet`, `/admin`, etc. are wrapped in it.

---

## Critical / high — logic and policy gaps

### 1. `require2FA` is never enforced

`RequireAuth` accepts `require2FA` and sets `has2FA` from `profile.isG2faEnabled`, but **never branches on it**. Every protected route uses `require2FA={true}` in `App.tsx`, yet users without 2FA still receive the full dashboard as long as `/auth/get-profile` succeeds.

**File:** `src/components/auth/RequireAuth.tsx`

**Risk:** If product policy requires 2FA before using the app, this is a **frontend policy bypass** unless the backend enforces the same rule.

---

### 2. Standalone `/2fa` page is a stub (fake verification)

`TwoFactorAuth` simulates success and navigates to `/success` **without calling the API**.

**File:** `src/pages/TwoFactorAuth.tsx`

**Risk:** Dead or misleading code if ever wired into a real flow; does not perform real verification.

---

### 3. Admin UX relies on `localStorage` role (not a security boundary)

Sidebar admin items use `userProfile.role === "ADMIN"` from `localStorage`. Anyone can edit `localStorage` in devtools to **see admin navigation and screens**. Correct behavior depends entirely on the **API returning 403** for non-admins.

**Files:** e.g. `src/components/dashboard/DashboardSidebar.tsx`, multiple pages reading `userProfile` from `localStorage`.

**Risk:** No additional protection if an admin API endpoint is misconfigured server-side.

---

### 4. Sensitive operator data in the browser

Admin user management surfaces **2FA secret material** in the DOM (high impact combined with XSS, shared machines, or compromised admin sessions).

**File:** `src/pages/admin/AdminUsers.tsx`

**Risk:** Design / exposure choice; treat as high for a financial app. Also note possible inconsistency: copy handler uses `user.twoFactorSecret.secretEnc` while visible text may use `user.twoFactorSecret` directly.

---

### 5. Registration “captcha” is client-only

`generateCaptcha()` in `SignupForm` is **purely client-side**; it does not prove humanness to the server unless `/auth/register` validates something else.

**File:** `src/components/SignupForm.tsx`

**Risk:** Bots can post directly to the API.

---

### 6. Wrong tree user ID in API hook

`useGetUserTree(userId)` ignores `userId` and always requests `/tree/user/1?depth=2`.

**File:** `src/pages/api/index.ts`

**Risk:** Incorrect behavior; depending on backend authorization, could be an **IDOR-style information leak** or broken authorization assumptions.

---

## Medium — session, storage, and CSRF

### 7. Full profile in `localStorage`

After login/signup/profile refresh, the app stores **`userProfile` in `localStorage`**, typically including PII and role flags. Readable by any script on the origin (**XSS = full read**). HttpOnly cookies protect tokens, not this blob.

---

### 8. CSRF and cookie auth

`withCredentials: true` on cross-origin requests requires strict **SameSite** and **CSRF** defenses on the API. The frontend cannot fix this alone.

---

### 9. “Remember me” in sign-in

The checkbox is collected in the form; it is **not obviously sent** in the login payload (only `phoneOrEmail`, `password`, optional `code`). If users expect longer sessions, expectations may not match implementation.

**File:** `src/components/SigninForm.tsx`

---

## Medium — dependency and supply chain

`npm audit` (as of analysis) reported **17 issues (11 high, 6 moderate)** in the dependency tree, including:

| Package / area | Notes |
|----------------|--------|
| `react-router` / `@remix-run/router` | High: XSS via open redirects ([GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx)) — upgrade `react-router-dom` / run `npm audit fix` |
| `axios` | High: DoS via `__proto__` in `mergeConfig` — patch axios |
| `socket.io-parser` | High: unbounded attachments — patch socket.io stack |
| `vite` / `esbuild` | Moderate: dev-server request handling — primarily **development** risk |

Treat audit output as a starting point; some items affect dev tooling only.

---

## Lower / hygiene

- **Password policy mismatch:** e.g. profile change `min(6)` vs reset password `min(8)` vs admin set-password `min(6)` — backend should be source of truth.
- **Sign-in identifier field:** `z.string().min(4)` for “email” — weak format validation (may be intentional for phone/member ID).
- **`console.log`:** e.g. signup payload — remove or gate for production builds.
- **No Content-Security-Policy** in `index.html` — reduces XSS defense-in-depth (often set at CDN/host).
- **`chart.tsx` `dangerouslySetInnerHTML`:** Injects CSS for chart themes; low XSS risk if config is trusted; risky if theme keys/colors come from untrusted API without validation.
- **Vite `server.host: "::"`** — dev server listens widely; use firewall / safe dev practices.

---

## Positive observations

- Refresh flow assumes **HttpOnly cookies** for refresh; access renewal via `/auth/refresh` avoids putting long-lived tokens in `localStorage` (profile blob is still stored there).
- **Real auth check:** `RequireAuth` uses the API, not only `localStorage`, for route gating.
- **Production admin host:** Redirect of admins to `admin.vaultireinfinite.com` in prod; `DashboardLayout` attempts to keep non-admins off the admin host — **API must still enforce** roles.

---

## Recommendations (summary)

1. Enforce **2FA policy on the server**; if required, implement `require2FA` in `RequireAuth` (redirect to `/security/2fa/setup` or equivalent) aligned with backend rules.
2. Remove or implement **real API verification** for `TwoFactorAuth`; do not ship stub flows to production.
3. Fix **`useGetUserTree`** to use the actual `userId` parameter; verify backend authorization on tree endpoints.
4. Revisit **display of 2FA secrets** in admin UI; minimize exposure and rely on secure recovery flows.
5. Replace or supplement client captcha with **server-side** bot controls (reCAPTCHA, Turnstile, rate limits, etc.).
6. **Patch dependencies** per `npm audit` and re-run tests.
7. Add **CSP** (and other security headers) at deploy layer where possible.
8. Ensure **`.env` / secrets** are not committed; remember **Vite `VITE_*`** variables are exposed to the client bundle.

---

## Files referenced

| Path | Relevance |
|------|-----------|
| `src/lib/api.ts` | Axios, cookies, refresh |
| `src/lib/socket.ts` | Socket.IO + credentials |
| `src/components/auth/RequireAuth.tsx` | Route guard, 2FA flag unused |
| `src/App.tsx` | Routes, `require2FA` usage |
| `src/components/SigninForm.tsx` | Login, `localStorage` profile |
| `src/components/SignupForm.tsx` | Registration, client captcha |
| `src/pages/TwoFactorAuth.tsx` | Stub 2FA page |
| `src/pages/api/index.ts` | `useGetUserTree` bug |
| `src/pages/admin/AdminUsers.tsx` | 2FA secret display |
| `src/components/dashboard/DashboardSidebar.tsx` | Admin UI from `localStorage` role |
| `index.html` | No CSP |
