import FloatingCoins from "@/components/FloatingCoins";
import SignupForm from "@/components/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex flex-col">
      <FloatingCoins />
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <SignupForm />
      </div>
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vaultire Infinite | All Rights Reserved
      </footer>
    </div>
  );
};

export default Index;
