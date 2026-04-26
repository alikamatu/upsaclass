import { apiClient } from "./api-client";
import { User } from "@/types";

export interface CreateRepData {
  studentId: string;
  fullName: string;
  courseIds: string[];
  password?: string;
}

export interface UpdateRepData {
  studentId: string;
  fullName: string;
  courseIds: string[];
}

export const userService = {
  getReps: () => 
    apiClient.get<{ success: boolean; data: User[] }>("/admin/reps")
      .then(res => res.data || []),
      
  createRep: (data: CreateRepData) => 
    apiClient.post<{ success: boolean; data: User }>("/admin/reps", data)
      .then(res => res.data),
    
  updateRep: (id: string, data: UpdateRepData) => 
    apiClient.put<{ success: boolean; data: User }>(`/admin/reps/${id}`, data)
      .then(res => res.data),
    
  updateRepPassword: (id: string, password: string) => 
    apiClient.put<{ success: boolean }>(`/admin/reps/${id}`, { password }),
    
  deleteRep: (id: string) => 
    apiClient.delete<{ success: boolean }>(`/admin/reps/${id}`),
};
