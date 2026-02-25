export interface Notification {
  id: number;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
}

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  redirectionRoute?: string;
}
