import FloatingCoins from "@/components/FloatingCoins";
import SigninForm from "@/components/SigninForm";

const Signin = () => {
  return (
    <div className="min-h-screen bg-gradient-crypto flex flex-col relative overflow-hidden">
      <FloatingCoins />
      <div className="flex-1 flex items-center justify-center">
        <SigninForm />
      </div>
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vaultire Infinite | All Rights Reserved
      </footer>
    </div>
  );
};

export default Signin;
