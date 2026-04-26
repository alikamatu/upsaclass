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
      const message = typeof error === "string"
        ? error
        : error?.message || error?.error || JSON.stringify(error) || "Request failed";
      toast.error(message);
      throw new Error(message);
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
