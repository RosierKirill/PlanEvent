"use client";

import { getCachedCoordinates } from "@/lib/geocoding-service";
import { initializeLeaflet } from "@/lib/leaflet-setup";
import type { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapSkeleton } from "./map-skeleton";

// Import dynamique consolidé avec skeleton
const MapContainer = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MapSkeleton /> }
);
const TileLayer = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.Popup),
  { ssr: false }
);

interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  location?: string;
  organizer?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
}

interface EventWithCoords extends Event {
  latitude: number;
  longitude: number;
}

export function EventMap() {
  const [events, setEvents] = useState<EventWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState<string>("");

  useEffect(() => {
    // Initialiser Leaflet une seule fois
    if (typeof window !== "undefined") {
      initializeLeaflet().then(() => {
        setIsMounted(true);
      });
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/events", { headers });
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const data = await response.json();

          // Handle different response formats
          let eventList: Event[] = [];
          if (Array.isArray(data)) {
            eventList = data;
          } else if (data && typeof data === "object") {
            // Check common property names for nested arrays
            if (Array.isArray(data.events)) {
              eventList = data.events;
            } else if (Array.isArray(data.data)) {
              eventList = data.data;
            } else if (Array.isArray(data.items)) {
              eventList = data.items;
            } else {
              console.warn("Unknown data structure:", data);
            }
          }

          // Géocodage optimisé avec cache
          const geocodedEvents: EventWithCoords[] = [];

          for (let i = 0; i < eventList.length; i++) {
            const event = eventList[i];

            // Si l'événement a déjà des coordonnées, les utiliser
            if (event.latitude && event.longitude) {
              geocodedEvents.push(event as EventWithCoords);
            }
            // Si l'événement a une localisation, la géocoder avec cache
            else if (event.location && typeof event.location === "string") {
              setGeocodingProgress(
                `Géocodage ${i + 1}/${eventList.length}: ${event.name}`
              );

              // Ajouter "France" pour améliorer la précision du géocodage
              const searchQuery = event.location.includes("France")
                ? event.location
                : `${event.location}, France`;

              const coords = await getCachedCoordinates(searchQuery);

              if (coords) {
                geocodedEvents.push({
                  ...event,
                  latitude: coords.lat,
                  longitude: coords.lng,
                });
              } else {
                console.warn(
                  `✗ Failed to geocode "${event.name}" at "${event.location}"`
                );
              }

              // Délai uniquement si ce n'est pas du cache (respecter Nominatim rate limit)
              // Le service de cache gère déjà le rate limiting
              await new Promise((resolve) => setTimeout(resolve, 1100));
            }
          }

          setEvents(geocodedEvents);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
        setGeocodingProgress("");
      }
    };

    fetchEvents();
  }, []);

  if (loading || !isMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-muted/20 rounded-lg gap-4">
        <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Chargement de la carte...</p>
        {geocodingProgress && (
          <p className="text-sm text-muted-foreground">{geocodingProgress}</p>
        )}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">
          Aucun événement avec une localisation trouvé
        </p>
      </div>
    );
  }

  // Centre par défaut: Lyon, France
  const center: LatLngExpression = [45.75, 4.85];

  // Si on a des événements avec coordonnées, centrer sur le premier
  const mapCenter: LatLngExpression =
    events.length > 0 && events[0].latitude && events[0].longitude
      ? [events[0].latitude, events[0].longitude]
      : center;

  return (
    <div
      className="w-full h-[600px] rounded-lg overflow-hidden border relative"
      style={{ zIndex: 0 }}
    >
      <MapContainer
        center={mapCenter}
        zoom={events.length > 0 ? 12 : 11}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          updateWhenZooming={false}
          keepBuffer={2}
        />
        {events.map((event) => {
          if (!event.latitude || !event.longitude) return null;

          return (
            <Marker key={event.id} position={[event.latitude, event.longitude]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-base mb-1">{event.name}</h3>
                  {event.organizer && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Organisateur: {event.organizer}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    📅{" "}
                    {new Date(event.start_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.end_date && (
                      <>
                        {" - "}
                        {new Date(event.end_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {event.location}
                    </p>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      🏷️ {event.tags.join(", ")}
                    </p>
                  )}
                  <a
                    href={`/events/${event.id}`}
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Voir les détails →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
