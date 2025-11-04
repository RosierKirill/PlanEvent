"use client";

import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

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

// Geocode an address using Nominatim (OpenStreetMap)
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    // Add "France" to improve geocoding accuracy
    const searchQuery = address.includes("France")
      ? address
      : `${address}, France`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PlanEvent/1.0", // Required by Nominatim
      },
    });

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error(`Failed to geocode address: ${address}`, error);
  }
  return null;
}

export function EventMap() {
  const [events, setEvents] = useState<EventWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState<string>("");

  useEffect(() => {
    // Fix for default marker icon in Leaflet
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
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

          // Geocode events that have location but no coordinates
          const geocodedEvents: EventWithCoords[] = [];

          for (let i = 0; i < eventList.length; i++) {
            const event = eventList[i];

            // If event already has coordinates, use them
            if (event.latitude && event.longitude) {
              geocodedEvents.push(event as EventWithCoords);
            }
            // If event has a location string, geocode it
            else if (event.location && typeof event.location === "string") {
              setGeocodingProgress(
                `Géocodage ${i + 1}/${eventList.length}: ${event.name}`
              );

              const coords = await geocodeAddress(event.location);
              if (coords) {
                geocodedEvents.push({
                  ...event,
                  latitude: coords.lat,
                  longitude: coords.lon,
                });
              } else {
                console.warn(
                  `✗ Failed to geocode "${event.name}" at "${event.location}"`
                );
              }
              // Add a small delay to respect Nominatim's usage policy (max 1 request per second)
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

  // Default center: Lyon, France
  const center: LatLngExpression = [45.75, 4.85];

  // If we have events with coordinates, center on the first one or calculate average
  const mapCenter: LatLngExpression =
    events.length > 0 && events[0].latitude && events[0].longitude
      ? [events[0].latitude, events[0].longitude]
      : center;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border relative" style={{ zIndex: 0 }}>
      <MapContainer
        center={mapCenter}
        zoom={events.length > 0 ? 12 : 11}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
