import { useGetWallets } from "@/pages/api/index";
import { Skeleton } from "@/components/ui/skeleton";

const walletConfig = [
  { type: "D_WALLET", label: "D", name: "D Wallet", gradient: "bg-gradient-to-br from-[#C84B31] to-[#8B2F1C]" },
  { type: "E_WALLET", label: "E", name: "E Wallet", gradient: "bg-gradient-to-br from-[#7B2D8E] to-[#4A1A55]" },
  { type: "A_WALLET", label: "A", name: "A Wallet", gradient: "bg-gradient-to-br from-[#2D8E5E] to-[#1A5538]" },
  { type: "P_WALLET", label: "P", name: "P Wallet", gradient: "bg-gradient-to-br from-[#4A4A4A] to-[#2A2A2A]" },
  { type: "BONUS_WALLET", label: "B", name: "B Wallet", gradient: "bg-gradient-to-br from-[#D4781C] to-[#8B4F12]" },
];

const TreeWalletCards = () => {
  const { data: wallets, isLoading, error } = useGetWallets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {walletConfig.map((wallet) => (
          <Skeleton key={wallet.type} className="h-20 rounded-xl bg-[#2a2a2a]" />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  const getWalletBalance = (type: string) => {
    const wallet = wallets?.find((w: any) => w.walletType === type);
    return wallet?.balance || 45500.12;
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {walletConfig.map((wallet) => (
        <div
          key={wallet.type}
          className={`relative overflow-hidden rounded-xl p-3 ${wallet.gradient}`}
        >
          {/* Badge */}
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
            <span className="text-white font-bold text-xs">{wallet.label}</span>
          </div>

          {/* Wallet Name */}
          <span className="text-white/70 text-[10px] block mb-0.5">{wallet.name}</span>

          {/* Balance */}
          <div className="text-white font-bold text-lg">
            ${getWalletBalance(wallet.type).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).replace('.', ',')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TreeWalletCards;
