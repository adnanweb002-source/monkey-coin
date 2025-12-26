import { useGetWallets } from "@/pages/api/index";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const walletConfig = [
  { type: "D_WALLET", label: "D", name: "D Wallet", gradient: "from-purple-600 to-purple-800" },
  { type: "M_WALLET", label: "M", name: "M Wallet", gradient: "from-blue-600 to-blue-800" },
  { type: "A_WALLET", label: "A", name: "A Wallet", gradient: "from-green-600 to-green-800" },
  { type: "I_WALLET", label: "I", name: "I Wallet", gradient: "from-slate-600 to-slate-800" },
  { type: "BONUS_WALLET", label: "B", name: "B Wallet", gradient: "from-orange-600 to-orange-800" },
];

const TreeWalletCards = () => {
  const { data: wallets, isLoading, error } = useGetWallets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {walletConfig.map((wallet) => (
          <Skeleton key={wallet.type} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  const getWalletBalance = (type: string) => {
    const wallet = wallets?.find((w: any) => w.walletType === type);
    return wallet?.balance || 0;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {walletConfig.map((wallet) => (
        <div
          key={wallet.type}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
            "bg-gradient-to-br",
            wallet.gradient,
            "hover:shadow-lg hover:scale-[1.02]"
          )}
        >
          {/* Badge */}
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <span className="text-white font-bold text-lg">{wallet.label}</span>
          </div>

          {/* Wallet Name */}
          <span className="text-white/70 text-sm">{wallet.name}</span>

          {/* Balance */}
          <div className="text-white font-bold text-xl mt-1">
            ${getWalletBalance(wallet.type).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TreeWalletCards;
