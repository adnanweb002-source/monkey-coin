interface WalletCard {
  id: number;
  label: string;
  amount: string;
  color: "red" | "blue" | "green" | "purple" | "orange";
  src: string;
  badge: string;
  type: "D_WALLET" | "P_WALLET" | "E_WALLET" | "A_WALLET";
  balance?: string;
}

interface ApiWallet {
  id: number;
  userId: number;
  type: "D_WALLET" | "P_WALLET" | "E_WALLET" | "A_WALLET";
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export type { WalletCard, ApiWallet }