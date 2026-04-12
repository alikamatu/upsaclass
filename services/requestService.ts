import { apiClient } from "./api-client";
import { ReassignmentRequest } from "@/types";

export const requestService = {
  getAll: () =>
    apiClient
      .get<{ requests: ReassignmentRequest[] }>("/requests")
      .then((response) => response.requests || []),
  
  create: (data: Partial<ReassignmentRequest>) => apiClient.post<ReassignmentRequest>("/requests", data),
  
  approve: (id: string, hallId: string, adminNotes?: string) => 
    apiClient.post(`/requests/${id}/approve`, { hallId, adminNotes }),
  
  reject: (id: string, adminNotes: string) => 
    apiClient.post(`/requests/${id}/reject`, { adminNotes }),
};
