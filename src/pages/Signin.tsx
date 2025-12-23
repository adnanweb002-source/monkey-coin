import FloatingCoins from "@/components/FloatingCoins";
import SigninForm from "@/components/SigninForm";

const Signin = () => {
  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center relative overflow-hidden">
      <FloatingCoins />
      <SigninForm />
    </div>
  );
};

export default Signin;
