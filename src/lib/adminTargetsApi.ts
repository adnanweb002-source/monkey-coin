import api from "@/lib/api";

interface TargetUser {
  id: number;
  memberId: string,
  firstName: string,
  lastName: string
}

interface TargetPackage {
  id: number;
  amount: string;
  packageId: number
}

export interface Target {
  id: number;
  memberId: string;
  packageAmount: number;
  multiplier: string;
  targetAmount: number;
  achieved: number;
  salesType: string;
  completed: boolean;
  createdAt: string;
  user: TargetUser;
  purchase: TargetPackage

}

export interface TargetStats {
  totalTargetsGiven: number;
  totalTargetsReached: number;
  totalRoiGenerated: number;
  roiFromCompletedTargets: number;
}

export interface BusinessVolumeStats {
  totalTargetVolume: number;
  totalAchievedVolume: number;
  remainingVolume: number;
  averageCompletionPercent: number;
  usersUnderTargetLock: number;
}

export interface TargetListResponse {
  data: Target[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssignTargetPayload {
  memberId: string;
  split: Record<string, number>;
  packageAmount: number;
  multiplier?: string;
  salesType?: string;
  targetAmount?: string;
  targetNeededToUnlockDailyRoi: number;
  targetMultiplier: string;
  targetType: string
}

export const assignTarget = async (data: AssignTargetPayload) => {
  const res = await api.post("/targets/assign", data);
  return res.data;
};

export const getTargets = async (params: {
  page?: number;
  limit?: number;
  memberId?: string;
  salesType?: string;
  completed?: string;
}): Promise<TargetListResponse> => {
  const res = await api.get("/targets", { params });
  return res.data;
};

export const updateTarget = async (
  targetId: number,
  data: Partial<AssignTargetPayload>,
) => {
  const res = await api.patch(`/targets/${targetId}`, data);
  return res.data;
};

export const deleteTarget = async (targetId: number) => {
  const res = await api.delete(`/targets/${targetId}`);
  return res.data;
};

export const getTargetStats = async (): Promise<TargetStats> => {
  const res = await api.get("/targets/stats");
  return res.data;
};

export const getBusinessVolumeStats = async (): Promise<BusinessVolumeStats> => {
  const res = await api.get("/targets/business-volume");
  return res.data;
};
