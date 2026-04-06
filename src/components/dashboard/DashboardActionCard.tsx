import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface DashboardActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  route: string;
}

const DashboardActionCard = ({ title, subtitle, icon: Icon, route }: DashboardActionCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/${route}`)}
      className="bg-card border border-border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.15)] group"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-primary text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardActionCard;
