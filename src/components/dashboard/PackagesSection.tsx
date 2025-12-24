import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Package {
  name: string;
  features: string[];
}

const packages: Package[] = [
  {
    name: "Starter",
    features: [
      "Feature 1 Advanced Analytics",
      "Feature 2 Customizable Dashboard",
      "Feature 3 Multi-language Support",
      "Feature 4 Real-time Collaboration",
    ],
  },
  {
    name: "MId",
    features: [
      "Feature 1 User-friendly Interface",
      "Feature 2 Enhanced Security Measures",
      "Feature 3 Offline Access Support",
      "Feature 4 Priority Customer Service",
    ],
  },
  {
    name: "Professional",
    features: [
      "Feature 1 Performance Tracking",
      "Feature 2 Automated Reports",
      "Feature 3 Data Export Options",
      "Feature 4 24/7 Technical Support",
    ],
  },
];

const PackagesSection = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Packages</h3>
      
      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <div key={index} className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">{pkg.name}</h4>
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                Purchase Now
              </Button>
            </div>
            
            <div className="space-y-2">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={12} className="text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagesSection;
