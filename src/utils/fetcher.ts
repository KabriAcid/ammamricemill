const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Global handler for unauthorized responses
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

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

    const data = await res.json();

    // Handle unauthorized responses
    if (res.status === 401 || res.status === 403) {
      // Don't trigger handler for login-related endpoints
      if (!url.includes("/auth/login") && !url.includes("/auth/logout")) {
        console.warn(`Auth token invalid/expired - Auto logout triggered
Status: ${res.status}
URL: ${url}
Response:`, data);
        unauthorizedHandler?.();
      }
    }

    // If response is not ok, throw error even if we got JSON
    if (!res.ok) {
      throw new ApiError(
        data?.message || `Request failed with status ${res.status}`,
        res.status
      );
    }

    // Check if we have a valid API response
    if (!data || (typeof data.success === "boolean" && !data.success)) {
      throw new ApiError(data?.message || "Operation failed", res.status);
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
