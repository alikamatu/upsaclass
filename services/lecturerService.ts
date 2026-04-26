import { apiClient } from "./api-client";
import { Lecturer } from "@/types";

export const lecturerService = {
  getAll: () => apiClient.get<{ success: boolean; data: Lecturer[] }>("/admin/lecturers")
    .then(res => res.data || []),
  
  create: (data: Partial<Lecturer>) => apiClient.post<{ success: boolean; data: Lecturer }>("/admin/lecturers", data)
    .then(res => res.data),
  
  update: (id: string, data: Partial<Lecturer>) => apiClient.put<{ success: boolean; data: Lecturer }>(`/admin/lecturers/${id}`, data)
    .then(res => res.data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/admin/lecturers/${id}`),
};
