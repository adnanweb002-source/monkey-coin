import m_wallet from "@/assets/m_wallet.svg";
import d_wallet from "@/assets/d_wallet.svg";
import a_wallet from "@/assets/a_wallet.svg";
import b_wallet from "@/assets/b_wallet.svg";
import type { ApiWallet, WalletCard } from "@/types/wallet";
import { useQueryClient } from "@tanstack/react-query";



export const walletConfig: Record<
  ApiWallet["type"],
  Omit<WalletCard, "id" | "amount" | "type" | "balance">
> = {
  D_WALLET: {
    label: "D Wallet",
    color: "red",
    src: b_wallet,
    badge: "D",
  },
  P_WALLET: {
    label: "P Wallet",
    color: "blue",
    src: b_wallet,
    badge: "P",
  },
  E_WALLET: {
    label: "E Wallet",
    color: "green",
    src: b_wallet,
    badge: "E",
  },
  A_WALLET: {
    label: "A Wallet",
    color: "orange",
    src: b_wallet,
    badge: "A",
  },
};
