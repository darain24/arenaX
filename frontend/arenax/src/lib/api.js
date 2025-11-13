import { getAccessToken, refreshAccessToken, clearTokens } from "./token";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Make an authenticated API request with automatic token refresh
 * @param {string} endpoint - API endpoint (relative to API_URL)
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const accessToken = getAccessToken();

  // Add authorization header if token exists
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired, try to refresh and retry once
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === "TOKEN_EXPIRED" || data.error === "Token expired") {
      try {
        // Refresh the token
        await refreshAccessToken();
        
        // Retry the request with new token
        const newAccessToken = getAccessToken();
        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and return original response
        clearTokens();
        throw refreshError;
      }
    }
  }

  return response;
}

/**
 * Helper function for GET requests
 */
export async function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: "GET" });
}

/**
 * Helper function for POST requests
 */
export async function apiPost(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for PUT requests
 */
export async function apiPut(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for DELETE requests
 */
export async function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: "DELETE" });
}

