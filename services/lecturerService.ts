import { apiClient } from "./api-client";
import { Lecturer } from "@/types";

export const lecturerService = {
  getAll: () => apiClient.get<Lecturer[]>("/admin/lecturers"),
  
  create: (data: Partial<Lecturer>) => apiClient.post<Lecturer>("/admin/lecturers", data),
  
  update: (id: string, data: Partial<Lecturer>) => apiClient.put<Lecturer>(`/admin/lecturers/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/admin/lecturers/${id}`),
};
