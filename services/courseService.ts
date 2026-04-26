import { apiClient } from "./api-client";
import { Course } from "@/types";

export const courseService = {
  getAll: () => apiClient.get<{ success: boolean; data: Course[] }>("/admin/courses")
    .then(res => res.data || []),
  
  create: (data: Partial<Course>) => apiClient.post<{ success: boolean; data: Course }>("/admin/courses", data)
    .then(res => res.data),
  
  update: (id: string, data: Partial<Course>) => apiClient.put<{ success: boolean; data: Course }>(`/admin/courses/${id}`, data)
    .then(res => res.data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean; message: string }>(`/admin/courses/${id}`),
};
