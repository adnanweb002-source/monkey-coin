interface WalletCard {
  id: string;
  label: string;
  amount: string;
  color: "red" | "blue" | "green" | "purple" | "orange";
}

const wallets: WalletCard[] = [
  { id: "D", label: "D Wallet", amount: "$45,500.12", color: "red" },
  { id: "M", label: "M wallet", amount: "$45,500.12", color: "blue" },
  { id: "A", label: "A Wallet", amount: "$45,500.12", color: "green" },
  { id: "U", label: "U Wallet", amount: "$45,500.12", color: "purple" },
  { id: "B", label: "B Wallet", amount: "$45,500.12", color: "orange" },
];

const colorClasses = {
  red: "from-red-500/20 to-red-600/40 border-red-500",
  blue: "from-blue-500/20 to-blue-600/40 border-blue-500",
  green: "from-green-500/20 to-green-600/40 border-green-500",
  purple: "from-purple-500/20 to-purple-600/40 border-purple-500",
  orange: "from-orange-500/20 to-orange-600/40 border-orange-500",
};

const badgeColors = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

const WalletCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${colorClasses[wallet.color]} border-l-4`}
        >
          <div className={`w-8 h-8 rounded-lg ${badgeColors[wallet.color]} flex items-center justify-center mb-3`}>
            <span className="text-white font-bold text-sm">{wallet.id}</span>
          </div>
          <p className="text-muted-foreground text-xs mb-1">{wallet.label}</p>
          <p className="text-foreground text-xl font-bold">{wallet.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default WalletCards;
