import { toast } from "sonner";

class ApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `/api${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const error = json || { message: "An unexpected error occurred" };
      toast.error(error.message || "Request failed");
      throw new Error(error.message || "Request failed");
    }

    if (json && typeof json === "object" && "data" in json) {
      return (json as any).data as T;
    }

    return json as T;
  }

  get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  patch<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
