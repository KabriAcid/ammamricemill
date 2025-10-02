const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function fetcher<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      
      if (errorData && errorData.message) {
        throw new ApiError(errorData.message, res.status);
      }
      
      throw new ApiError(`Request failed with status ${res.status}`, res.status);
    }

    const data = await res.json();

    if (!data) {
      throw new ApiError("No data returned from server", 204);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Utility functions for common API calls
export const api = {
  get: <T>(url: string) => fetcher<T>(url),
  post: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) => fetcher<T>(url, { method: "DELETE" }),
};
