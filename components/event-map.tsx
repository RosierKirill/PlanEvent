"use client";

import { geocodeWithProgress } from "@/lib/geocoding-service";
import { initializeLeaflet } from "@/lib/leaflet-setup";
import type { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapSkeleton } from "./map-skeleton";
import { MapBoundsAdjuster } from "./map-bounds-adjuster";

// Import dynamique consolidé - tous les composants proviennent du même module
// Next.js va automatiquement regrouper ces imports car ils viennent de la même source
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
  address?: string;
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
        // Réinitialiser les événements au début de chaque fetch
        setEvents([]);
        setLoading(true);

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

          // Dédupliquer les événements par ID d'abord
          const uniqueEvents = Array.from(
            new Map(eventList.map((event) => [event.id, event])).values()
          );

          // Ajouter immédiatement les événements qui ont déjà des coordonnées
          uniqueEvents.forEach((event) => {
            if (event.latitude && event.longitude) {
              const eventWithCoords: EventWithCoords = {
                id: event.id,
                name: event.name,
                start_date: event.start_date,
                end_date: event.end_date,
                location: event.location,
                organizer: event.organizer,
                tags: event.tags,
                latitude: event.latitude,
                longitude: event.longitude,
              };

              setEvents((prev) => {
                if (prev.some((e) => e.id === eventWithCoords.id)) {
                  return prev;
                }
                return [...prev, eventWithCoords];
              });
            }
          });

          // Préparer les événements qui nécessitent un géocodage
          const eventsForGeocoding = uniqueEvents
            .filter((event) => {
              // Ne géocoder que si pas de coordonnées ET qu'il y a une location
              const hasCoords = event.latitude && event.longitude;
              const hasLocation = event.location;
              return !hasCoords && hasLocation;
            })
            .map((event) => {
              const location = event.location || "";
              const address = location.includes("France")
                ? location
                : `${location}, France`;
              return { ...event, address };
            });

          // Géocodage optimisé avec chargement progressif
          await geocodeWithProgress(
            eventsForGeocoding,
            (event, coords, current, total) => {
              setGeocodingProgress(`Chargement: ${current}/${total} événements`);

              // Mettre à jour progressivement la carte avec les événements géocodés
              if (coords || (event.latitude && event.longitude)) {
                const eventWithCoords: EventWithCoords = {
                  id: event.id,
                  name: event.name,
                  start_date: event.start_date,
                  end_date: event.end_date,
                  location: event.location,
                  organizer: event.organizer,
                  tags: event.tags,
                  latitude: event.latitude || coords!.lat,
                  longitude: event.longitude || coords!.lng,
                };

                // Ajouter l'événement à la liste au fur et à mesure, en évitant les doublons
                setEvents((prev) => {
                  // Vérifier si l'événement existe déjà
                  if (prev.some((e) => e.id === eventWithCoords.id)) {
                    return prev;
                  }
                  return [...prev, eventWithCoords];
                });
              }
            }
          );
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

  // Créer un tableau de positions pour le MapBoundsAdjuster
  const eventPositions: LatLngExpression[] = events.map((event) => [
    event.latitude,
    event.longitude,
  ]);

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
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          updateWhenZooming={false}
          keepBuffer={2}
          noWrap={true}
        />
        <MapBoundsAdjuster positions={eventPositions} />
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
