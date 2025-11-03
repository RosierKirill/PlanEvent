"use client";

import { useEffect, useState } from "react";

interface User {
  id?: string;
  email?: string;
  [key: string]: any;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }

      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    logout,
  };
}

// Export alias for backward compatibility with useAuthToken
export const useAuthToken = () => {
  const { token } = useAuth();
  return token;
};
