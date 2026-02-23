import api from "@/lib/api";
import type { NotificationsResponse } from "@/types/notification";

export const fetchNotifications = async (
  take = 10,
  skip = 0
): Promise<NotificationsResponse> => {
  const { data } = await api.get<NotificationsResponse>(
    `/notifications?take=${take}&skip=${skip}`
  );
  return data;
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};
