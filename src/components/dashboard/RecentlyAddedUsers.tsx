import { Button } from "@/components/ui/button";

interface User {
  name: string;
  id: string;
  avatar: string;
  isOnline?: boolean;
}

const recentUsers: User[] = [
  { name: "Frank Wright", id: "1234567890", avatar: "🧔", isOnline: true },
  { name: "Alice Johnson", id: "1234567891", avatar: "👩", isOnline: false },
  { name: "Brian Smith", id: "1234567892", avatar: "👨", isOnline: false },
  { name: "Catherine Lee", id: "1234567893", avatar: "👩‍🦰", isOnline: false },
  { name: "David Brown", id: "1234567894", avatar: "🧑", isOnline: false },
  { name: "Sophia Chen", id: "1234567897", avatar: "👧", isOnline: false },
];

const RecentlyAddedUsers = () => {
  const hasUsers = recentUsers.length > 0;

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recently Added User</h3>
      
      {hasUsers ? (
        <>
          <div className="space-y-3">
            {recentUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {user.avatar}
                  </div>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">ID - {user.id}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="default" className="w-full mt-4">
            Load More
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl mb-4">
            👥
          </div>
          <p className="text-muted-foreground text-sm">No users added yet</p>
          <p className="text-muted-foreground/70 text-xs mt-1">New users will appear here</p>
        </div>
      )}
    </div>
  );
};

export default RecentlyAddedUsers;
