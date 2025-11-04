"use client";

import { useAuth } from "@/hooks/use-auth";

export function useIsAdmin() {
  const { user } = useAuth();
  const role = (user as any)?.role || (user as any)?.roles || (user as any)?.is_admin;
  // Accept a few common shapes: string role, array contains 'admin', boolean is_admin
  const isAdmin = Array.isArray(role)
    ? role.map(String).some((r) => r.toLowerCase() === "admin")
    : typeof role === "string"
    ? role.toLowerCase() === "admin"
    : role === true;
  return isAdmin;
}

