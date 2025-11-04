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

interface EventMiniMapProps {
  location: string;
  name: string;
}

// Geocode an address using Nominatim (OpenStreetMap)
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const searchQuery = address.includes("France")
      ? address
      : `${address}, France`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PlanEvent/1.0",
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

export function EventMiniMap({ location, name }: EventMiniMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

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
    const fetchCoords = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      const result = await geocodeAddress(location);
      setCoords(result);
      setLoading(false);
    };

    fetchCoords();
  }, [location]);

  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center h-[250px] bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-[250px] bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Localisation non disponible
        </p>
      </div>
    );
  }

  const position: LatLngExpression = [coords.lat, coords.lon];

  return (
    <div className="w-full h-[250px] rounded-lg overflow-hidden border relative" style={{ zIndex: 0 }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}
