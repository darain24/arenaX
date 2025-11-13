// Token management utilities

export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

/**
 * Get access token from localStorage
 */
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated (has tokens)
 */
export function isAuthenticated() {
  return !!(getAccessToken() && getRefreshToken());
}

/**
 * Refresh the access token using the refresh token from localStorage
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    // If refresh fails, clear tokens
    clearTokens();
    throw new Error(data?.error || "Failed to refresh token");
  }

  const data = await response.json();
  if (data.accessToken) {
    setAccessToken(data.accessToken);
    return data.accessToken;
  }

  throw new Error("No access token in refresh response");
}

