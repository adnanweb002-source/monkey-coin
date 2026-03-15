import api from "@/lib/api";

export interface Rank {
  id: string;
  name: string;
  order: number;
  requiredLeft: number;
  requiredRight: number;
  rewardAmount: number;
  rewardTitle?: string;
}

export interface UserRank {
  id: string;
  name: string;
  reward: number;
  order: number;
  rewardTitle?: string;
  requiredLeft: number;
  requiredRight: number;
  claimable: boolean;
  unlocked: boolean;
}

export interface RankProgress {
  rank: string;
  leftProgress: number;
  rightProgress: number;
  requiredLeft: number;
  requiredRight: number;
  completed?: boolean;
}

// Admin APIs
export const getRanks = () => api.get<Rank[]>("/ranks").then((r) => r.data);

export const createRank = (data: Omit<Rank, "id">) =>
  api.post("/admin/create-rank", data).then((r) => r.data);

export const updateRank = (id: string, data: Omit<Rank, "id">) =>
  api.patch(`/admin/ranks/${id}`, data).then((r) => r.data);

export const deleteRank = (id: string) =>
  api.delete(`/admin/ranks/${id}`).then((r) => r.data);

// User APIs
export const getUserRanks = () =>
  api.get<UserRank[]>("/ranks/user").then((r) => r.data);

export const getRankProgress = () =>
  api.get<RankProgress>("/ranks/progress").then((r) => r.data);

export const claimRank = (rankId: string) =>
  api.post(`/ranks/claim/${rankId}`).then((r) => r.data);
