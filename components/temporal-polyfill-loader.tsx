"use client";

import { useEffect, useState } from "react";

export function TemporalPolyfillLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Temporal is already loaded
    if (typeof window !== "undefined" && "Temporal" in window) {
      setIsLoaded(true);
      return;
    }

    // Load the polyfill
    import("temporal-polyfill/global")
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Temporal polyfill:", err);
        setIsLoaded(true); // Still render to show error
      });
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[700px] border rounded-md bg-card">
        <p className="text-muted-foreground">Initialisation...</p>
      </div>
    );
  }

  return <>{children}</>;
}
