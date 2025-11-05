"use client";

import { getCachedCoordinates } from "@/lib/geocoding-service";
import { initializeLeaflet } from "@/lib/leaflet-setup";
import type { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MiniMapSkeleton } from "./map-skeleton";

// Imports dynamiques consolidés avec skeleton
const MapContainer = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MiniMapSkeleton /> }
);
const TileLayer = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.Marker),
  { ssr: false }
);

interface EventMiniMapProps {
  location: string;
  name: string;
}

export function EventMiniMap({ location, name }: EventMiniMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initialiser Leaflet une seule fois
    if (typeof window !== "undefined") {
      initializeLeaflet().then(() => {
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

      // Ajouter "France" pour améliorer la précision
      const searchQuery = location.includes("France")
        ? location
        : `${location}, France`;

      // skipDelay: true car c'est une seule adresse (pas de batch)
      const result = await getCachedCoordinates(searchQuery, true);
      setCoords(result);
      setLoading(false);
    };

    fetchCoords();
  }, [location]);

  if (loading || !isMounted) {
    return <MiniMapSkeleton />;
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

  const position: LatLngExpression = [coords.lat, coords.lng];

  return (
    <div
      className="w-full h-[250px] rounded-lg overflow-hidden border relative"
      style={{ zIndex: 0 }}
    >
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
          maxZoom={19}
          updateWhenZooming={false}
          keepBuffer={2}
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}
