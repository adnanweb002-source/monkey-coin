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
  F_WALLET: {
    label: "F Wallet",
    color: "red",
    src: d_wallet,
    badge: "F",
  },
  I_WALLET: {
    label: "I Wallet",
    color: "blue",
    src: a_wallet,
    badge: "I",
  },
  M_WALLET: {
    label: "M Wallet",
    color: "green",
    src: m_wallet,
    badge: "M",
  },
  BONUS_WALLET: {
    label: "Bonus Wallet",
    color: "orange",
    src: b_wallet,
    badge: "B",
  },
};
