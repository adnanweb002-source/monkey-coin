import { useGetWallets } from "@/pages/api/index";
import { Skeleton } from "@/components/ui/skeleton";

const walletConfig = [
  { type: "D_WALLET", label: "D", name: "D Wallet", bgColor: "bg-[#C84B31]" },
  { type: "M_WALLET", label: "M", name: "M wallet", bgColor: "bg-[#7B2D8E]" },
  { type: "A_WALLET", label: "A", name: "A Wallet", bgColor: "bg-[#2D8E5E]" },
  { type: "U_WALLET", label: "U", name: "U Wallet", bgColor: "bg-[#4A4A4A]" },
  { type: "BONUS_WALLET", label: "B", name: "B Wallet", bgColor: "bg-[#D4781C]" },
];

const TreeWalletCards = () => {
  const { data: wallets, isLoading, error } = useGetWallets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {walletConfig.map((wallet) => (
          <Skeleton key={wallet.type} className="h-28 rounded-xl bg-[#2a2a2a]" />
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {walletConfig.map((wallet) => (
        <div
          key={wallet.type}
          className={`relative overflow-hidden rounded-xl p-4 ${wallet.bgColor}`}
        >
          {/* Badge */}
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
            <span className="text-white font-bold text-sm">{wallet.label}</span>
          </div>

          {/* Wallet Name */}
          <span className="text-white/80 text-xs block mb-1">{wallet.name}</span>

          {/* Balance */}
          <div className="text-white font-bold text-xl">
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
