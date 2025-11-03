/**
 * Custom event system for authentication state changes
 * Allows components to react to login/logout without page reload
 */

const AUTH_CHANGE_EVENT = "auth-state-changed";

/**
 * Dispatch an authentication state change event
 * Call this after login/logout to notify all listeners
 */
export function dispatchAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

/**
 * Listen for authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Cleanup function to remove the listener
 */
export function onAuthChange(callback: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener(AUTH_CHANGE_EVENT, callback);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  }
  return () => {};
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

/**
 * Helper function to set auth token and notify listeners
 */
export function setAuthToken(token: string, user?: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    dispatchAuthChange();
  } catch (e) {
    console.error("Failed to set auth token", e);
  }
}

/**
 * Helper function to clear auth token and notify listeners
 */
export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatchAuthChange();
  } catch (e) {
    console.error("Failed to clear auth token", e);
  }
}
