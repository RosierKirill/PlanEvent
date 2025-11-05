"use client";
import { useAuthToken } from "@/hooks/use-auth";
import { getImageForTags } from "@/lib/tag-images";
import { Calendar, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

interface EventsListProps {
  limit?: number;
}

export default function EventsList({ limit }: EventsListProps) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const searchParams = useSearchParams();
  const q = searchParams?.get("q");
  const tag = searchParams?.get("tag");
  const token = useAuthToken();

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    const url = `/api/events${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch(url, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();

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
        // Normalize possible response shapes from upstream
        // Accept: Array, { events: Array }, { data: Array }, { items: Array }, { results: Array }
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === "object") {
          list = data.events || data.data || data.items || data.results || [];
        }

        if (!Array.isArray(list)) {
          console.error("Expected array but got:", typeof list, list);
          throw new Error("Format de réponse inattendu pour les événements");
        }

        // Client-side filtering if backend doesn't filter by `q` or `tag`
        let filtered = list;
        if (q && typeof q === "string" && q.trim()) {
          const needle = q.trim().toLowerCase();
          filtered = filtered.filter((ev: any) => {
            const title = String(ev.title || ev.name || "").toLowerCase();
            const desc = String(ev.description || "").toLowerCase();
            const loc = String(ev.location || "").toLowerCase();
            const tags = Array.isArray(ev.tags)
              ? ev.tags
                  .map((t: any) => String(t))
                  .join(" ")
                  .toLowerCase()
              : "";
            return (
              title.includes(needle) ||
              desc.includes(needle) ||
              loc.includes(needle) ||
              tags.includes(needle)
            );
          });
        }

        // Filter by tag if specified
        if (tag && typeof tag === "string" && tag.trim()) {
          const tagNeedle = tag.trim().toLowerCase();
          filtered = filtered.filter((ev: any) => {
            if (!Array.isArray(ev.tags)) return false;
            return ev.tags.some(
              (t: any) => String(t).toLowerCase() === tagNeedle
            );
          });
        }

        // Apply limit if specified
        const finalEvents = limit ? filtered.slice(0, limit) : filtered;

        setEvents(finalEvents);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [q, tag, limit]);

  if (loading) return <div>Chargement des événements...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {events.map((ev) => {
        const title = ev.title || ev.name || "Sans titre";
        const start = ev.date || ev.start_date;
        const end = ev.end_date;
        const startStr = start ? new Date(start).toLocaleDateString() : "";
        const endStr = end ? new Date(end).toLocaleDateString() : "";
        const when = endStr && startStr ? `${startStr} – ${endStr}` : startStr;

        const tagImage = getImageForTags(ev.tags);
        const imageUrl = tagImage || ev.image_url || ev.image || ev.photo || "/event.png";

        return (
          <a
            key={ev.id}
            href={`/events/${ev.id}`}
            className="flex overflow-hidden border rounded-xl bg-card hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 ease-out"
          >
            <div className="shrink-0 w-40 h-full relative bg-muted">
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>

            <div className="flex-1 p-6">
              <h3 className="text-xl font-bold mb-4">{title}</h3>

              <div className="space-y-2 mb-4">
                {when ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{when}</span>
                  </div>
                ) : null}

                {ev.location ? (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{ev.location}</span>
                  </div>
                ) : null}
              </div>

              {ev.tags && Array.isArray(ev.tags) && ev.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ev.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </a>
        );
      })}
    </div>
  );
}
