import { apiClient } from "./api-client";
import { LectureHall } from "@/types";

export const hallService = {
  getAll: () => apiClient.get<{ success: boolean; data: LectureHall[] }>("/admin/halls")
    .then(res => res.data || []),
  
  getAvailable: (date?: string, startTime?: string, endTime?: string) => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (startTime) params.append("startTime", startTime);
    if (endTime) params.append("endTime", endTime);
    return apiClient.get<LectureHall[]>(`/halls/available?${params.toString()}`);
  },
  
  create: (data: Partial<LectureHall>) => apiClient.post<{ success: boolean; data: LectureHall }>("/admin/halls", data)
    .then(res => res.data),
  
  update: (id: string, data: Partial<LectureHall>) => apiClient.put<{ success: boolean; data: LectureHall }>(`/admin/halls/${id}`, data)
    .then(res => res.data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/admin/halls/${id}`),
};
