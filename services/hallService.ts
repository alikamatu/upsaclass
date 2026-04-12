import { apiClient } from "./api-client";
import { LectureHall } from "@/types";

export const hallService = {
  getAll: () => apiClient.get<LectureHall[]>("/admin/halls"),
  
  getAvailable: (date?: string, startTime?: string, endTime?: string) => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (startTime) params.append("startTime", startTime);
    if (endTime) params.append("endTime", endTime);
    return apiClient.get<LectureHall[]>(`/halls/available?${params.toString()}`);
  },
  
  create: (data: Partial<LectureHall>) => apiClient.post<LectureHall>("/admin/halls", data),
  
  update: (id: string, data: Partial<LectureHall>) => apiClient.put<LectureHall>(`/admin/halls/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/admin/halls/${id}`),
};
