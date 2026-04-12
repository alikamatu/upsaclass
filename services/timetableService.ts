import { apiClient } from "./api-client";
import { TimetableSlot } from "@/types";

export const timetableService = {
  getAll: () => apiClient.get<TimetableSlot[]>("/admin/timetable"),
  
  create: (data: Partial<TimetableSlot>) => apiClient.post<TimetableSlot>("/admin/timetable", data),
  
  update: (id: string, data: Partial<TimetableSlot>) => apiClient.put<TimetableSlot>(`/admin/timetable/${id}`, data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean; message: string }>(`/admin/timetable/${id}`),
};
