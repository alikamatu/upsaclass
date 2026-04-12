import { apiClient } from "./api-client";
import { Course } from "@/types";

export const courseService = {
  getAll: () => apiClient.get<Course[]>("/admin/courses"),
  
  create: (data: Partial<Course>) => apiClient.post<Course>("/admin/courses", data),
  
  update: (id: string, data: Partial<Course>) => apiClient.put<Course>(`/admin/courses/${id}`, data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean; message: string }>(`/admin/courses/${id}`),
};
