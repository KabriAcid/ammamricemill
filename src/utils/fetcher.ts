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
    
    // Get token from localStorage
    const user = localStorage.getItem("ammam_user");
    const token = user ? JSON.parse(user).token : null;

    // Ensure headers is a plain object
    let headers: Record<string, string> = {};

    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (options.headers && typeof options.headers === "object") {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(fullUrl, {
      ...options,
      credentials: "include",
      headers,
    });

    const data = await res.json();

    // Handle unauthorized responses
    if (res.status === 401 || res.status === 403) {
      // Don't trigger handler for login-related endpoints
      if (!url.includes("/auth/login") && !url.includes("/auth/logout")) {
        console.warn(
          `Auth token invalid/expired - Auto logout triggered
            Status: ${res.status}
            URL: ${url}
            Response:`,
          data
        );
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
// Function to handle file downloads
async function downloadFile(url: string): Promise<void> {
  try {
    // Get token from localStorage
    const user = localStorage.getItem("ammam_user");
    const token = user ? JSON.parse(user).token : null;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData?.message || `Download failed with status ${response.status}`,
        response.status
      );
    }

    // Get filename from Content-Disposition header or fallback to a default
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    const filename = filenameMatch
      ? filenameMatch[1].replace(/['"]/g, "")
      : "download";

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Download failed",
      0
    );
  }
}

export const api = {
  get: <T>(url: string) => fetcher<T>(url),
  post: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    }),
  put: <T>(url: string, data: any) =>
    fetcher<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string, data?: any) =>
    fetcher<T>(url, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }),
  upload: <T>(url: string, formData: FormData) =>
    fetcher<T>(url, {
      method: "POST",
      body: formData,
      headers: {}, // Let the browser set the Content-Type with boundary for FormData
    }),
  download: (url: string) => downloadFile(url),
};
