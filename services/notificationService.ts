import { apiClient } from "./api-client";
import { Notification } from "@/types";

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  getAll: () => apiClient.get<NotificationResponse>("/notifications"),
  markAsRead: (id: string) => apiClient.put<{ success: boolean; notification: Notification }>("/notifications", { id }),
};
