import { apiClient } from "./api-client";
import { TimetableSlot } from "@/types";

export const timetableService = {
  getAll: () => apiClient.get<{ success: boolean; data: TimetableSlot[] }>("/admin/timetable")
    .then(res => res.data || []),
  
  create: (data: Partial<TimetableSlot>) => apiClient.post<{ success: boolean; data: TimetableSlot }>("/admin/timetable", data)
    .then(res => res.data),
  
  update: (id: string, data: Partial<TimetableSlot>) => apiClient.put<{ success: boolean; data: TimetableSlot }>(`/admin/timetable/${id}`, data)
    .then(res => res.data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean; message: string }>(`/admin/timetable/${id}`),

  getRepSlots: () => apiClient.get<{ slots: any[] }>("/rep/slots").then(res => res.slots || []),
};
