import { apiClient } from "./api-client";
import { Building } from "@/types";

export const buildingService = {
  getAll: () => apiClient.get<{ success: boolean; data: Building[] }>("/admin/buildings")
    .then(res => res.data || []),
  
  create: (data: Partial<Building>) => apiClient.post<{ success: boolean; data: Building }>("/admin/buildings", data)
    .then(res => res.data),
  
  update: (id: string, data: Partial<Building>) => apiClient.put<{ success: boolean; data: Building }>(`/admin/buildings/${id}`, data)
    .then(res => res.data),
  
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/admin/buildings/${id}`),
};
