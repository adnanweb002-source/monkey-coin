import type { WalletCard } from "@/types/wallet";
import { walletConfig } from "@/lib/config";
import { useNavigate } from "react-router-dom";
const badgeColors = {
  F_WALLET: "#FF971D",
  I_WALLET: "#FF971D",
  M_WALLET: "#FF971D",
  BONUS_WALLET: "#FF971D",
};

const WalletCards = ({ wallets, columns }: { wallets: WalletCard[]; columns?: number }) => {
  const mappedWallets: WalletCard[] = wallets?.map((wallet: WalletCard) => {
    const config = walletConfig[wallet?.type];
   
    return {
      id: wallet.id,
      label: config.label,
      amount: `$${Number(wallet?.balance)?.toLocaleString()}`,
      color: config.color,
      src: config.src,
      badge: config.badge,
      type: wallet?.type,
    };
  });
 const navigate = useNavigate();
  return (
    <div className={`grid gap-4 w-full ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
      {mappedWallets?.map((wallet: WalletCard) => (
        <div
          key={wallet.id}
          className="relative min-h-[10rem] w-full overflow-hidden rounded-lg p-4 cursor-pointer"
          onClick={()=>{
            navigate("/reports/wallets")
          }}
        >
          {/* Background image */}
          <img
            src={wallet.src}
            alt={wallet.label}
            className="absolute inset-0 w-full h-full object-cover !rounded-lg opacity-100"
          />

          <div className="relative z-10 mt-2 rounded-md">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3">
              <span
                style={{ color: badgeColors[wallet?.type] }}
                className="font-poppins font-bold text-sm"
              >
                {wallet?.badge}
              </span>
            </div>

            <p className="text-white text-xs mb-1 font-poppins">
              {wallet?.label}
            </p>
            <p className="text-white font-poppins text-xl font-bold">
              {wallet?.amount}
            </p>
             <p className="text-white font-poppins text-sm font-bold underline">
              {wallet?.type === "F_WALLET" ? "Deposit Wallet" : wallet?.type === "I_WALLET" ? "Passive Income Wallet" : wallet?.type === "M_WALLET" ? "Earning Wallet" : wallet?.type === "BONUS_WALLET" ? "Awards Wallet" : wallet?.type}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletCards;
