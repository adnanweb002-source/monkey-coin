import FloatingCoins from "@/components/FloatingCoins";
import SignupForm from "@/components/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Floating Coins Background */}
      <FloatingCoins />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <SignupForm />
      </div>
    </div>
  );
};

export default Index;
