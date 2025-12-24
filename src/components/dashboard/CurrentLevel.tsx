interface Level {
  name: string;
  points: string;
  perks: string[];
  icon: string;
  color: string;
  isReached?: boolean;
  isMaxLevel?: boolean;
}

const levels: Level[] = [
  { name: "Plankton", points: "1000 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🦐", color: "text-purple-400", isReached: true },
  { name: "Shrimp", points: "2500 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🦐", color: "text-green-400", isReached: true },
  { name: "Dolphin", points: "5000 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🐬", color: "text-blue-400", isReached: true },
  { name: "Shark", points: "10000 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🦈", color: "text-orange-400", isReached: true },
  { name: "Whale", points: "15000 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🐋", color: "text-red-400" },
  { name: "Kraken", points: "25000 Points", perks: ["Perk 1", "Perk 2", "Perk 3"], icon: "🐙", color: "text-gray-400", isMaxLevel: true },
];

const CurrentLevel = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Current Level</h3>
      
      <div className="space-y-4">
        {levels.map((level, index) => (
          <div key={index} className="flex items-start gap-4">
            {/* Icon and connector */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                {level.icon}
              </div>
              {index < levels.length - 1 && (
                <div className="w-0.5 h-8 bg-border mt-2 relative">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 flex justify-between items-start">
              <div>
                <p className={`font-semibold ${level.color}`}>{level.name}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {level.perks.map((perk, i) => (
                    <span key={i} className="block">{perk}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${level.color}`}>{level.points}</p>
                {level.isReached && (
                  <p className="text-xs text-green-400 mt-1">Next Level Reached</p>
                )}
                {level.isMaxLevel && (
                  <p className="text-xs text-muted-foreground mt-1">Max Level Reached</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentLevel;
