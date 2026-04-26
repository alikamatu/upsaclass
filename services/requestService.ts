import { apiClient } from "./api-client";
import { ReassignmentRequest } from "@/types";

export interface CreateRequestPayload {
  slotId: string;
  preferredHallId?: string;
  reason: string;
  requestedDate?: string | null;
}

export const requestService = {
  getAll: () =>
    apiClient
      .get<{ requests: ReassignmentRequest[] }>("/requests")
      .then((response) => response.requests || []),
  
  create: (data: CreateRequestPayload) => 
    apiClient.post<ReassignmentRequest>("/requests", data),
  
  approve: (id: string, hallId: string, adminNotes?: string, isOneTime?: boolean, specificDate?: string | null) => 
    apiClient.post<{ success: boolean }>(`/requests/${id}/approve`, { hallId, adminNotes, isOneTime, specificDate }),
  
  reject: (id: string, adminNotes: string) => 
    apiClient.post<{ success: boolean }>(`/requests/${id}/reject`, { adminNotes }),
};
