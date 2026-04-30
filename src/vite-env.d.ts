/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_UNDER_MAINTENANCE?: string;
  /** Dev-only: same value as ADMIN_WALLET_ADJUST_KEY for local signing in the bundle (never use in prod). */
  readonly VITE_ADMIN_WALLET_ADJUST_DEV_KEY?: string;
}
