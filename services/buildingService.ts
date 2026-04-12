import { apiClient } from "./api-client";
import { Building } from "@/types";

export const buildingService = {
  getAll: () => apiClient.get<Building[]>("/admin/buildings"),
  
  create: (data: Partial<Building>) => apiClient.post<Building>("/admin/buildings", data),
  
  update: (id: string, data: Partial<Building>) => apiClient.put<Building>(`/admin/buildings/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/admin/buildings/${id}`),
};
