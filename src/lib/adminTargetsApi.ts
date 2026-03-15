import api from "@/lib/api";

export interface Target {
  id: number;
  memberId: string;
  packageAmount: number;
  targetMultiplier: string;
  targetAmount: number;
  achieved: number;
  remaining: number;
  salesType: string;
  completed: boolean;
  createdAt: string;
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
  targetMultiplier: string;
  targetType: string;
  targetNeededToUnlockDailyRoi: number;
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
  const res = await api.get("/admin/targets", { params });
  return res.data;
};

export const updateTarget = async (
  targetId: number,
  data: Partial<AssignTargetPayload>,
) => {
  const res = await api.patch(`/admin/targets/${targetId}`, data);
  return res.data;
};

export const deleteTarget = async (targetId: number) => {
  const res = await api.delete(`/admin/targets/${targetId}`);
  return res.data;
};

export const getTargetStats = async (): Promise<TargetStats> => {
  const res = await api.get("/admin/targets/stats");
  return res.data;
};

export const getBusinessVolumeStats = async (): Promise<BusinessVolumeStats> => {
  const res = await api.get("/admin/targets/business-volume");
  return res.data;
};
