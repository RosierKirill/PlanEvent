"use client";

import "@/app/calendar-scoped.css";
import "@/app/calendar-theme.css";
import * as React from "react";
import { TemporalPolyfillLoader } from "./temporal-polyfill-loader";

interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
}

export function UserEventsCalendar() {
  return (
    <TemporalPolyfillLoader>
      <UserEventsCalendarInner />
    </TemporalPolyfillLoader>
  );
}

function UserEventsCalendarInner() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [CalendarComponent, setCalendarComponent] = React.useState<any>(null);

  // Load calendar library after ensuring Temporal is available
  React.useEffect(() => {
    let isMounted = true;

    async function loadLibraries() {
      try {
        // Wait for Temporal to be available
        let retries = 0;
        while (
          typeof window !== "undefined" &&
          !("Temporal" in window) &&
          retries < 50
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }

        if (!isMounted) return;

        if (typeof window !== "undefined" && !("Temporal" in window)) {
          throw new Error("Temporal polyfill failed to load");
        }

        // Now safely import calendar component
        const { default: CalendarWrapper } = await import(
          "./user-events-calendar-wrapper"
        );

        if (isMounted) {
          setCalendarComponent(() => CalendarWrapper);
        }
      } catch (err) {
        console.error("Failed to load calendar:", err);
        if (isMounted) {
          setError("Impossible de charger le calendrier");
          setLoading(false);
        }
      }
    }

    loadLibraries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user events
  React.useEffect(() => {
    if (!CalendarComponent) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    // First, fetch user info to get the user ID
    fetch("/api/users/me", { headers })
      .then(async (res) => {
        const text = await res.text();
        const ct = res.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        const userData = isJson ? JSON.parse(text || "{}") : {};
        if (!res.ok) {
          throw new Error(
            userData?.error || userData?.message || `Erreur ${res.status}`
          );
        }

        // Get user ID from response
        const userId = userData?.id || userData?.user_id;
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur");
        }

        // Then fetch user events using the user ID
        return fetch(`/api/users/${userId}/events`, { headers });
      })
      .then(async (res) => {
        const text = await res.text();
        const ct = res.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        const data = isJson ? JSON.parse(text || "[]") : [];
        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || `Erreur ${res.status}`
          );
        }

        // Transform backend response to match Event interface
        const transformedEvents = Array.isArray(data)
          ? data.map((event: any) => ({
              id: event.id,
              name: event.name,
              description: event.description,
              location: event.location,
              startDate: event.start_date || event.startDate,
              endDate: event.end_date || event.endDate,
            }))
          : [];

        setEvents(transformedEvents);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Erreur réseau");
        setLoading(false);
      });
  }, [CalendarComponent]);

  if (!CalendarComponent || loading) {
    return (
      <div className="flex items-center justify-center h-[700px] border rounded-md bg-card">
        <p className="text-muted-foreground">Chargement du calendrier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[700px] border rounded-md bg-card">
        <p className="text-destructive">Erreur : {error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[700px] border rounded-md bg-card">
        <p className="text-muted-foreground">
          Vous ne participez à aucun événement pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <CalendarComponent events={events} />
    </div>
  );
}
