import api from "@/lib/api";

export interface UserTarget {
  id: number;
  packageAmount: number;
  multiplier: string;
  targetAmount: number;
  achieved: number;
  remaining: number;
  salesType: string;
  completed: boolean;
  targetNeededToUnlockDailyRoi: number;
  createdAt: string;
}

export const getMyTargets = async (): Promise<UserTarget[]> => {
  const res = await api.get("/targets/my");
  return res.data;
};
