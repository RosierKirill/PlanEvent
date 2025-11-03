"use client";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useSearchParams } from "next/navigation";
import * as React from "react";

export default function EventsList() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const searchParams = useSearchParams();
  const q = searchParams?.get("q");
  const token = useAuthToken();

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const url = `/api/events${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch(url, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();
        console.log("Client received response:", {
          status: res.status,
          contentType: ct,
          body: text,
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`);
        if (!ct.includes("application/json"))
          throw new Error("Réponse non JSON du serveur");

        try {
          return JSON.parse(text);
        } catch (e: any) {
          console.error("JSON parse error:", e);
          throw new Error(`Impossible de parser la réponse JSON: ${e.message}`);
        }
      })
      .then((data) => {
        console.log("Parsed response data:", data);

        // Normalize possible response shapes from upstream
        // Accept: Array, { events: Array }, { data: Array }, { items: Array }, { results: Array }
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === "object") {
          list = data.events || data.data || data.items || data.results || [];
        }

        console.log("Normalized events list:", list);

        if (!Array.isArray(list)) {
          console.error("Expected array but got:", typeof list, list);
          throw new Error("Format de réponse inattendu pour les événements");
        }

        setEvents(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [q]);

  if (loading) return <div>Chargement des événements...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;

  return (
    <div className="space-y-4">
      {events.map((ev) => {
        const title = ev.title || ev.name || "Sans titre";
        const start = ev.date || ev.start_date;
        const end = ev.end_date;
        const startStr = start ? new Date(start).toLocaleDateString() : "";
        const endStr = end ? new Date(end).toLocaleDateString() : "";
        const when = endStr && startStr ? `${startStr} – ${endStr}` : startStr;

        return (
          <a
            key={ev.id}
            href={`/events/${ev.id}`}
            className="block p-4 border rounded-lg bg-card hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="text-sm text-muted-foreground">
              {when}
              {ev.location ? ` · ${ev.location}` : ""}
            </div>
            {ev.description ? (
              <p className="mt-2 text-sm">{ev.description}</p>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
