import coinBitcoin from "@/assets/coin-bitcoin.png";
import coinEthereum from "@/assets/coin-ethereum.png";
import coinLitecoin from "@/assets/coin-litecoin.png";

const FloatingCoins = () => {
  const coins = [
    { src: coinBitcoin, className: "top-4 left-1/2 -translate-x-1/2 w-32 h-32 animate-float", alt: "Bitcoin" },
    { src: coinEthereum, className: "top-20 left-20 w-20 h-20 animate-float-delayed opacity-80", alt: "Ethereum" },
    { src: coinLitecoin, className: "top-32 right-20 w-24 h-24 animate-float-slow opacity-90", alt: "Litecoin" },
    { src: coinBitcoin, className: "top-1/2 left-10 w-28 h-28 animate-float-delayed opacity-70", alt: "Bitcoin" },
    { src: coinEthereum, className: "top-1/2 right-16 w-32 h-32 animate-float opacity-80", alt: "Ethereum" },
    { src: coinLitecoin, className: "bottom-32 left-16 w-20 h-20 animate-float-slow opacity-60", alt: "Litecoin" },
    { src: coinBitcoin, className: "bottom-20 right-32 w-24 h-24 animate-float-delayed opacity-70", alt: "Bitcoin" },
    { src: coinEthereum, className: "bottom-10 left-1/3 w-28 h-28 animate-float opacity-50", alt: "Ethereum" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {coins.map((coin, index) => (
        <img
          key={index}
          src={coin.src}
          alt={coin.alt}
          className={`floating-coin ${coin.className}`}
        />
      ))}
    </div>
  );
};

export default FloatingCoins;
