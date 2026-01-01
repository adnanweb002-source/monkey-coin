import type { WalletCard } from "@/types/wallet";
import { walletConfig } from "@/lib/config";

const badgeColors = {
  F_WALLET: "#AC4CBC",
  I_WALLET: "#68CF29",
  M_WALLET: "#3A82EF",
  BONUS_WALLET: "#FF971D",
};

const WalletCards = ({ wallets }: { wallets: WalletCard[] }) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full justify-items-center">
      {mappedWallets?.map((wallet: WalletCard) => (
        <div
          key={wallet.id}
          className="relative min-h-[10rem] w-full max-w-[280px] sm:max-w-none overflow-hidden rounded-lg p-4"
        >
          {/* Background image */}
          <img
            src={wallet.src}
            alt={wallet.label}
            className="absolute top-0 left-0 bottom-0 !rounded-lg opacity-100"
          />

          <div className="relative z-10  mt-2 rounded-md">
            <div
              className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3 `}
            >
              <span
                style={{ color: badgeColors[wallet?.type] }}
                className={`font-poppins   font-bold text-sm`}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletCards;