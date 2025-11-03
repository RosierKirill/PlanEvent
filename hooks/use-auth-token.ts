"use client";

import { useEffect, useState } from "react";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Only access localStorage after component mounts on client
    setToken(localStorage.getItem("token"));
  }, []);

  return token;
}
