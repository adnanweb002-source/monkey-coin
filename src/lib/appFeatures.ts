export type AppFeatureGroup = "menu" | "admin" | "legal" | "account";

export interface AppFeature {
  id: string;
  labelKey: string;
  path: string;
  group: AppFeatureGroup;
  adminOnly?: boolean;
  /** Extra English tokens to improve search matching */
  searchHints?: string[];
}

/** All dashboard destinations reachable from the feature search panel. */
export const APP_FEATURES: AppFeature[] = [
  { id: "panel", labelKey: "sidebar.panel", path: "/panel", group: "menu" },
  {
    id: "profile",
    labelKey: "sidebar.myProfile",
    path: "/profile",
    group: "menu",
  },
  {
    id: "deposit",
    labelKey: "sidebar.deposit",
    path: "/wallet/deposit",
    group: "menu",
    searchHints: ["wallet", "fund"],
  },
  {
    id: "withdraw",
    labelKey: "sidebar.withdrawalFunds",
    path: "/wallet/withdraw",
    group: "menu",
  },
  {
    id: "transfer",
    labelKey: "sidebar.transferFunds",
    path: "/wallet/transfer",
    group: "menu",
  },
  {
    id: "deposit-requests",
    labelKey: "sidebar.depositRequests",
    path: "/wallet/deposit-requests",
    group: "menu",
  },
  {
    id: "transactions",
    labelKey: "sidebar.transactions",
    path: "/wallet/transactions",
    group: "menu",
  },
  {
    id: "packages",
    labelKey: "sidebar.makeInvestment",
    path: "/packages",
    group: "menu",
  },
  { id: "tree", labelKey: "sidebar.myTree", path: "/tree", group: "menu" },
  {
    id: "downline-view",
    labelKey: "sidebar.downlineView",
    path: "/tree/downline",
    group: "menu",
    searchHints: ["team", "binary", "referral", "network"],
  },
  {
    id: "income-daily",
    labelKey: "sidebar.dailyIncome",
    path: "/income/daily",
    group: "menu",
  },
  {
    id: "income-binary",
    labelKey: "sidebar.binaryIncome",
    path: "/income/binary",
    group: "menu",
  },
  {
    id: "income-referral",
    labelKey: "sidebar.referralIncome",
    path: "/income/referral",
    group: "menu",
  },
  {
    id: "reports-wallets",
    labelKey: "sidebar.wallets",
    path: "/reports/wallets",
    group: "menu",
  },
  {
    id: "gain-daily",
    labelKey: "sidebar.dailyEarningsReport",
    path: "/reports/gain-report?type=DAILY",
    group: "menu",
  },
  {
    id: "gain-referral",
    labelKey: "sidebar.referralEarningsReport",
    path: "/reports/gain-report?type=REFERRAL",
    group: "menu",
  },
  {
    id: "gain-binary",
    labelKey: "sidebar.binaryEarningsReport",
    path: "/reports/gain-report?type=BINARY",
    group: "menu",
  },
  {
    id: "withdraw-requests",
    labelKey: "sidebar.withdrawalStatus",
    path: "/wallet/withdraw-requests",
    group: "menu",
  },
  {
    id: "gain-package",
    labelKey: "sidebar.packagePurchaseReport",
    path: "/reports/gain-report?type=PACKAGE_PURCHASE",
    group: "menu",
  },
  {
    id: "gain-package-self",
    labelKey: "sidebar.packagePurchaseReportSelf",
    path: "/reports/gain-report?type=PACKAGE_PURCHASE&self=yes",
    group: "menu",
  },
  {
    id: "deposit-history",
    labelKey: "sidebar.depositHistory",
    path: "/wallet/deposit-history",
    group: "menu",
  },
  {
    id: "downline-deposit",
    labelKey: "sidebar.downlineDeposit",
    path: "/reports/downline-deposit",
    group: "menu",
  },
  {
    id: "awards-ranks",
    labelKey: "sidebar.awardsAndRanks",
    path: "/reports/ranks",
    group: "menu",
  },
  {
    id: "targets",
    labelKey: "sidebar.targets",
    path: "/targets",
    group: "menu",
  },
  {
    id: "notifications",
    labelKey: "sidebar.notifications",
    path: "/notifications",
    group: "menu",
  },
  {
    id: "holiday-list",
    labelKey: "sidebar.holidayList",
    path: "/reports/holiday-list",
    group: "menu",
  },
  {
    id: "support",
    labelKey: "sidebar.contactSupport",
    path: "/support",
    group: "menu",
  },
  {
    id: "track-referral",
    labelKey: "reports.trackReferral",
    path: "/reports/track-referral",
    group: "menu",
  },
  {
    id: "rank-reward",
    labelKey: "reports.rankAndReward",
    path: "/reports/rank-reward",
    group: "menu",
    searchHints: ["leaderboard", "bv"],
  },
  {
    id: "2fa-setup",
    labelKey: "profile.setup2FA",
    path: "/security/2fa/setup",
    group: "account",
    searchHints: ["security", "otp", "authenticator"],
  },
  {
    id: "privacy",
    labelKey: "sidebar.privacyPolicy",
    path: "/privacy",
    group: "legal",
  },
  {
    id: "terms",
    labelKey: "sidebar.termsOfUse",
    path: "/terms",
    group: "legal",
  },
  {
    id: "admin-users",
    labelKey: "admin.userManagement",
    path: "/admin/users",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-packages",
    labelKey: "admin.packagesManagement",
    path: "/admin/packages",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-2fa-reset",
    labelKey: "admin.twoFactorResetRequests",
    path: "/admin/two-factor-reset-requests",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-deposits",
    labelKey: "admin.deposits",
    path: "/admin/deposits",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-wallet-rules",
    labelKey: "admin.packageWalletRules",
    path: "/admin/package-wallet-rules",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-ranks",
    labelKey: "admin.ranks",
    path: "/admin/ranks",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-targets",
    labelKey: "admin.targets",
    path: "/admin/targets",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-wallet-types",
    labelKey: "admin.supportedWalletTypes",
    path: "/admin/supported-wallet-types",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-settings",
    labelKey: "admin.systemSettings",
    path: "/admin/settings",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-deposit-bonus",
    labelKey: "admin.depositBonus",
    path: "/admin/deposit-bonus",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-power-sheet",
    labelKey: "admin.powerSheet",
    path: "/admin/power-sheet",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-support",
    labelKey: "admin.supportQueries",
    path: "/admin/support/queries",
    group: "admin",
    adminOnly: true,
  },
  {
    id: "admin-prune",
    labelKey: "admin.systemPrune",
    path: "/admin/system/prune",
    group: "admin",
    adminOnly: true,
  },
];

export function parseFeaturePath(path: string): {
  pathname: string;
  search?: string;
} {
  const q = path.indexOf("?");
  if (q === -1) return { pathname: path };
  return {
    pathname: path.slice(0, q),
    search: path.slice(q),
  };
}
